import { createClient } from "@deepgram/sdk";
import { inngest } from "./client";
import axios from "axios";
import { GenerateImageScript } from "@/configs/AiModel";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import {getServices, renderMediaOnCloudrun} from '@remotion/cloudrun/client';

const ImagePromptScript = `Generate Image prompt of {style} style with all details for each scene for 30 seconds video : script: {script}
-Just Give specifing image prompt depends on the story line
- do not give camera angle image prompt
-Follow the Following schema and return JSON data (Max 4-5 Images)
- [
    {   imagePrompt:'',       
        sceneContent: ' <Script Content>'
    }
]`

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

const BASE_URL = "https://aigurulab.tech";
export const GenerateVideoData = inngest.createFunction(
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId, animeId} = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

    // Optional: Fetch Anime Assets if animeId is present
    const AnimeAssets = await step.run("fetchAnimeAssets", async () => {
      if (!animeId) return null;
      try {
        const query = `
        query ($id: Int) {
          Media (id: $id) {
            bannerImage
            coverImage { extraLarge }
            characters (sort: [ROLE, RELEVANCE], perPage: 5) {
                nodes { image { large } }
            }
          }
        }`;
        const response = await axios.post("https://graphql.anilist.co", {
            query,
            variables: { id: animeId }
        });
        const media = response.data.data.Media;
        const images = [];
        if (media.bannerImage) images.push(media.bannerImage);
        if (media.coverImage?.extraLarge) images.push(media.coverImage.extraLarge);
        media.characters?.nodes?.forEach(n => {
            if (n.image?.large) images.push(n.image.large);
        });
        return images;
      } catch (e) {
        console.error("Error fetching anime assets:", e);
        return null;
      }
    });

    //Generate Audio File MP3
    const GenerateAudioFile = await step.run(
      "generateAudioFile", 
      async () => {
      const result = await axios.post(BASE_URL + "/api/text-to-speech",
        {
          input: script,
          voice: voice,
        },
        {
          headers: {
            "x-api-key": process.env.AIGURULAB_API_KEY,
            "Content-Type": "application/json",
          },
        })
      return result.data.audio;
      // return "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/audio%2F1740311920126.mp3?alt=media&token=77ca0183-566c-43c1-a9df-7c4936440aff"
    }
  )

    //Generate Captions
    const GenerateCaptions = await step.run(
      "generateCaptions", 
      async () => {
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      // STEP 2: Call the transcribeUrl method with the audio payload and options
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: GenerateAudioFile,
        },
        // STEP 3: Configure Deepgram options for audio analysis
        {
          model: "nova-3",
        }
      );
      return result.results?.channels[0]?.alternatives[0]?.words;

    }
  )

    //Generate Image Prompt from Script 
    const GenerateImagePrompts = await step.run(
      "generateImagePrompt", 
      async () => {
        const stylePrefix = videoStyle === 'anime' ? 'high quality anime art style, detailed, cinematic lighting' : videoStyle;
        const FINAL_PROMPT = ImagePromptScript
        .replace('{style}', stylePrefix).replace('{script}',script);
        const result  = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const resp = JSON.parse( result.response.text());

        return resp;
    }
  )
    //Generate Image using AI
    const GenerateImages = await step.run("generateImages", async () => {
      let images = [];
      
      // If we have anime assets, we can use some of them directly or as reference
      // For now, let's prepend them to the AI generated list if they exist
      const animeStills = AnimeAssets || [];

      const aiImages = await Promise.all(
        GenerateImagePrompts.map(async (element) => {
          // If it's anime, add more descriptive keywords to the prompt
          const enhancedPrompt = videoStyle === 'anime' 
            ? `${element?.imagePrompt}, high-res anime, vivid colors, masterpiece, vertical orientation`
            : element?.imagePrompt;

          const result = await axios.post(BASE_URL + "/api/generate-image",
            {
              width: 1024,
              height: 1024,
              input: enhancedPrompt,
              model: "sdxl", //'flux'
              aspectRatio: "1:1",
            },
            {
              headers: {
                "x-api-key": process.env.AIGURULAB_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          return result.data.image;
        })
      )
      
      // Merge: take first 2 anime assets and then AI images, capped at 5 total
      return [...animeStills.slice(0, 2), ...aiImages].slice(0, 5);
    });

    //Save All Data to DB
    const UpdateDB = await step.run(
      'UpdateDB',
      async() => {
        const result = await convex.mutation(api.videoData.UpdateVideoRecord,{
          recordId: recordId,
          audioUrl: GenerateAudioFile,
          captionJson: GenerateCaptions,
          images: GenerateImages
        });
        return result;
      }
    )


    const RenderVideo = await step.run(
      "renderVideo",
      async()=>{
        //Render Video
        const services = await getServices({
          region: 'us-east1',
          compatibleOnly: true,
        });
         
        const serviceName = services[0].serviceName;

        const result = await renderMediaOnCloudrun({
          serviceName,
          region: 'us-east1',
          serveUrl: process.env.GCP_SERVE_URL,
          composition: 'youtubeShort',
          inputProps: {
            videoData:{
              audioUrl: GenerateAudioFile,
              captionJson: GenerateCaptions,
              images: GenerateImages
          }
          },
          codec: 'h264',

        });
         
        if (result.type === 'success') {
          // Render success
        }
        return result?.publicUrl;
      }
    )

    const UpdateDownloadUrl = await step.run(
      'updateDownloadUrl',
      async () => {
        const result = await convex.mutation(api.videoData.UpdateVideoRecord,{
          recordId: recordId,
          audioUrl: GenerateAudioFile,
          captionJson: GenerateCaptions,
          images: GenerateImages,
          downloadUrl: RenderVideo
        });
        return result;
      }
    )

    // return GenerateAudioFile;
    // return GenerateCaptions;
    // return GenerateImagePrompts;
    // return GenerateImages;
    // return "Executed Successfully"
    return RenderVideo;
  }
)

export const RefreshExpiringTokens = inngest.createFunction(
  { id: "refresh-expiring-tokens" },
  { cron: "0 2 * * *" },  // Daily at 2am UTC
  async ({ step }) => {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Step 1: Find all accounts expiring within 7 days
    const expiringAccounts = await step.run('findExpiringAccounts', async () => {
      return await convex.query(api.socialAccounts.GetExpiringAccounts, {
        withinMs: 7 * 24 * 60 * 60 * 1000
      });
    });

    if (!expiringAccounts?.length) {
      return { refreshed: 0, message: 'No expiring accounts found' };
    }

    // Step 2: Refresh each account token
    const results = await step.run('refreshTokens', async () => {
      const outcomes = [];

      for (const account of expiringAccounts) {
        try {
          if (account.platform === 'youtube' && account.refreshToken) {
            // YouTube: use refresh_token grant to get a new access token
            const res = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: account.refreshToken,
                grant_type: 'refresh_token',
              }),
            });
            const tokens = await res.json();

            if (tokens.access_token) {
              await convex.mutation(api.socialAccounts.UpdateSocialAccountTokens, {
                accountId: account._id,
                accessToken: tokens.access_token,
                expiresAt: Date.now() + (tokens.expires_in * 1000),
              });
              outcomes.push({ id: account._id, platform: 'youtube', status: 'refreshed' });
            } else {
              outcomes.push({ id: account._id, platform: 'youtube', status: 'failed', error: tokens.error });
            }

          } else if (account.platform === 'instagram' && account.accessToken) {
            // Instagram: exchange current token for a new long-lived token
            const res = await fetch(
              `https://graph.facebook.com/v19.0/oauth/access_token?` +
              new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: account.accessToken,
              })
            );
            const tokens = await res.json();

            if (tokens.access_token) {
              await convex.mutation(api.socialAccounts.UpdateSocialAccountTokens, {
                accountId: account._id,
                accessToken: tokens.access_token,
                expiresAt: Date.now() + ((tokens.expires_in || 5184000) * 1000),
              });
              outcomes.push({ id: account._id, platform: 'instagram', status: 'refreshed' });
            } else {
              outcomes.push({ id: account._id, platform: 'instagram', status: 'failed', error: tokens.error });
            }
          }
        } catch (err) {
          outcomes.push({ id: account._id, platform: account.platform, status: 'error', error: err.message });
        }
      }

      return outcomes;
    });

    const refreshed = results.filter(r => r.status === 'refreshed').length;
    const failed = results.filter(r => r.status !== 'refreshed').length;

    return { refreshed, failed, total: expiringAccounts.length };
  }
)

export const ProcessRecurringSchedules = inngest.createFunction(
  { id: "process-recurring-schedules" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    const schedules = await step.run("fetch-active-schedules", async () => {
      return await convex.query(api.recurringSchedules.GetActiveSchedules, {});
    });

    if (!schedules?.length) {
      return { processed: 0, message: "No active recurring schedules" };
    }

    const results = [];

    for (const schedule of schedules) {
      const result = await step.run(`check-schedule-${schedule._id}`, async () => {
        const now = new Date();
        const tzNow = new Date(now.toLocaleString("en-US", { timeZone: schedule.timezone }));
        const currentDay = tzNow.getDay();
        const currentHour = tzNow.getHours();

        if (currentDay !== schedule.dayOfWeek || currentHour !== schedule.hour) {
          return { skipped: true, reason: "Not the right time" };
        }

        if (schedule.lastTriggeredAt) {
          const hoursSince = (now.getTime() - schedule.lastTriggeredAt) / (1000 * 60 * 60);
          if (hoursSince < 20) {
            return { skipped: true, reason: "Already triggered recently" };
          }
        }

        // Find videos that haven't been successfully posted or are currently pending for this platform
        const allVideos = await convex.query(api.videoData.GetUserVideo, { uid: schedule.uid });
        const scheduledPosts = await convex.query(api.scheduledPosts.GetAllUserScheduledPosts, { uid: schedule.uid });

        const excludedVideoIds = new Set(
          (scheduledPosts || [])
            .filter(p => p.platform === schedule.platform && (p.status === "pending" || p.status === "success" || p.status === "uploading"))
            .map(p => p.videoId)
        );

        // Find the oldest video (GetUserVideo returns desc, so we reverse or pick from end)
        const eligibleVideos = (allVideos || []).filter(v => !excludedVideoIds.has(v._id) && v.status === 'completed');
        const nextVideo = eligibleVideos[eligibleVideos.length - 1]; // Oldest first

        if (!nextVideo) {
          return { skipped: true, reason: `No unscheduled videos available for ${schedule.platform}` };
        }

        // Calculate next occurrence timestamp
        const scheduledFor = new Date(tzNow);
        scheduledFor.setMinutes(schedule.minute);
        scheduledFor.setSeconds(0);
        scheduledFor.setMilliseconds(0);

        // Create the scheduled post
        const scheduleId = await convex.mutation(api.scheduledPosts.CreateSchedule, {
          uid: schedule.uid,
          videoId: nextVideo._id,
          platform: schedule.platform,
          scheduledFor: scheduledFor.getTime(),
        });

        // Trigger the actual upload job
        await step.send({
          name: "post.scheduled",
          data: {
            scheduleId,
            videoId: nextVideo._id,
            platform: schedule.platform,
            scheduledFor: scheduledFor.getTime(),
            uid: schedule.uid,
          },
        });

        // Update lastTriggeredAt
        await convex.mutation(api.recurringSchedules.UpdateLastTriggered, {
          scheduleId: schedule._id,
        });

        return { triggered: true, videoId: nextVideo._id, platform: schedule.platform };
      });

      results.push(result);
    }

    const triggered = results.filter(r => r.triggered).length;
    const skipped = results.filter(r => r.skipped).length;

    return { triggered, skipped, total: schedules.length };
  }
);

export const ExecuteScheduledUpload = inngest.createFunction(
  { id: "execute-scheduled-upload", retries: 2 },
  { event: "post.scheduled" },
  async ({ event, step }) => {
    const { scheduleId, videoId, platform, scheduledFor, uid } = event.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // 1. Wait until the scheduled time
    await step.sleepUntil("wait-for-schedule", new Date(scheduledFor));

    // 2. Mark as uploading
    await step.run("mark-uploading", async () => {
      await convex.mutation(api.scheduledPosts.UpdateScheduleStatus, {
        scheduleId,
        status: "uploading",
      });
    });

    // 3. Fetch the video record to get downloadUrl and caption
    const videoRecord = await step.run("fetch-video", async () => {
      return await convex.query(api.videoData.GetVideoById, { videoId });
    });

    if (!videoRecord?.downloadUrl) {
      await step.run("mark-failed-no-video", async () => {
        await convex.mutation(api.scheduledPosts.UpdateScheduleStatus, {
          scheduleId,
          status: "failed",
          error: "Video download URL not available",
        });
      });
      return { error: "No download URL" };
    }

    // 4. Fetch the scheduled post to get caption/tags
    const scheduledPost = await step.run("fetch-schedule", async () => {
      const posts = await convex.query(api.scheduledPosts.GetPostSchedules, { videoId });
      return posts?.find((p) => p._id === scheduleId);
    });

    // 5. Fetch latest active tokens from userSocialAccounts
    const tokenData = await step.run("fetch-tokens", async () => {
      return await convex.query(api.socialAccounts.GetSocialAccountByPlatform, {
        uid,
        platform,
      });
    });

    if (!tokenData?.accessToken) {
      await step.run("mark-failed-no-token", async () => {
        await convex.mutation(api.scheduledPosts.UpdateScheduleStatus, {
          scheduleId,
          status: "failed",
          error: `No active ${platform} account connected`,
        });
      });
      return { error: "No token" };
    }

    // 6. Download video into buffer
    const videoBuffer = await step.run("download-video", async () => {
      const response = await fetch(videoRecord.downloadUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64");
    });

    // 7. Execute platform upload
    const uploadResult = await step.run("execute-upload", async () => {
      const videoData = Buffer.from(videoBuffer, "base64");
      const postCaption = scheduledPost?.caption || videoRecord.title || "";
      const postTags = scheduledPost?.tags || "";

      if (platform === "youtube") {
        // YouTube Data API v3 — resumable upload
        const { google } = await import("googleapis");
        const { Readable } = await import("stream");

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ access_token: tokenData.accessToken });

        const youtube = google.youtube({ version: "v3", auth: oauth2Client });

        const res = await youtube.videos.insert({
          part: ["snippet", "status"],
          requestBody: {
            snippet: {
              title: videoRecord.title || "Untitled Video",
              description: postCaption + (postTags ? "\n\n" + postTags.split(",").map((t) => `#${t.trim()}`).join(" ") : ""),
              categoryId: "22", // People & Blogs
            },
            status: {
              privacyStatus: "public",
              selfDeclaredMadeForKids: false,
            },
          },
          media: {
            body: Readable.from(videoData),
          },
        });

        return {
          publishId: res.data.id,
          url: `https://youtube.com/watch?v=${res.data.id}`,
        };
      } else if (platform === "instagram") {
        // Instagram Reels via Facebook Graph API
        // Step A: Create media container with video URL
        const createRes = await fetch(
          `https://graph.facebook.com/v19.0/${tokenData.platformUserId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              media_type: "REELS",
              video_url: videoRecord.downloadUrl,
              caption: postCaption + (postTags ? "\n\n" + postTags.split(",").map((t) => `#${t.trim()}`).join(" ") : ""),
              access_token: tokenData.accessToken,
            }),
          }
        );
        const createData = await createRes.json();
        if (!createData.id) throw new Error("IG container creation failed: " + JSON.stringify(createData));

        // Step B: Wait for processing (poll status)
        let status = "IN_PROGRESS";
        let attempts = 0;
        while (status === "IN_PROGRESS" && attempts < 30) {
          await new Promise((r) => setTimeout(r, 10000)); // 10s
          const statusRes = await fetch(
            `https://graph.facebook.com/v19.0/${createData.id}?fields=status_code&access_token=${tokenData.accessToken}`
          );
          const statusData = await statusRes.json();
          status = statusData.status_code;
          attempts++;
        }

        if (status !== "FINISHED") throw new Error(`IG processing failed: ${status}`);

        // Step C: Publish
        const publishRes = await fetch(
          `https://graph.facebook.com/v19.0/${tokenData.platformUserId}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: createData.id,
              access_token: tokenData.accessToken,
            }),
          }
        );
        const publishData = await publishRes.json();

        return {
          publishId: publishData.id,
          url: `https://instagram.com/reel/${publishData.id}`,
        };
      }

      throw new Error(`Unsupported platform: ${platform}`);
    });

    // 8. Mark successful
    await step.run("mark-success", async () => {
      await convex.mutation(api.scheduledPosts.UpdateScheduleStatus, {
        scheduleId,
        status: "success",
        uploadUrl: uploadResult.url,
      });
    });

    return uploadResult;
  }
);
