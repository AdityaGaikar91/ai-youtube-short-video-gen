import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users:defineTable({
        name:v.string(),
        email:v.string(),
        pictureURL:v.string(),
        credits:v.number()
    }),
    videoData:defineTable({
        title: v.string(),
        topic: v.string(),
        script: v.string(),
        videoStyle: v.string(),
        caption: v.any(),
        voice: v.string(),
        images: v.optional(v.array(v.string())),
        audioUrl: v.optional(v.string()),
        captionJson: v.optional(v.array(v.object({
            word: v.string(),
            start: v.number(),
            end: v.number(),
            confidence: v.number()
        }))),
        uid: v.id('users'),
        createdBy: v.string(),
        status: v.optional(v.string()),
        downloadUrl: v.optional(v.string()),
        seriesId: v.optional(v.id('videoSeries')),
        partNumber: v.optional(v.number()),
    }).index('by_seriesId', ['seriesId'])
      .index('by_uid', ['uid']),
    userSocialAccounts: defineTable({
        uid: v.id('users'),
        platform: v.string(),               // 'youtube' | 'instagram'
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.optional(v.number()),  // Unix timestamp ms
        platformUserId: v.string(),         // YouTube channel ID or Instagram user ID
        platformUsername: v.string(),       // Display name / channel title
        platformAvatarUrl: v.optional(v.string()),
        pageId: v.optional(v.string()),     // Instagram: linked Facebook Page ID
        connectedAt: v.number(),            // Unix timestamp ms
        isActive: v.boolean(),
    })
        .index('by_uid', ['uid'])
        .index('by_uid_platform', ['uid', 'platform']),
    scheduledPosts: defineTable({
        uid: v.id('users'),
        videoId: v.id('videoData'),
        platform: v.string(), // 'youtube' | 'instagram'
        scheduledFor: v.number(), // Unix timestamp (ms)
        status: v.string(), // 'pending', 'uploading', 'success', 'failed'
        caption: v.optional(v.string()),
        tags: v.optional(v.string()),
        uploadUrl: v.optional(v.string()), // URL to the post after successful upload
        error: v.optional(v.string()),
    }).index('by_uid', ['uid'])
      .index('by_videoId', ['videoId'])
      .index('by_status', ['status']),
    recurringSchedules: defineTable({
        uid: v.id('users'),
        platform: v.string(),
        dayOfWeek: v.number(),
        hour: v.number(),
        minute: v.number(),
        timezone: v.string(),
        isActive: v.boolean(),
        lastTriggeredAt: v.optional(v.number()),
        createdAt: v.number(),
    }).index('by_uid', ['uid'])
      .index('by_active', ['isActive']),
    animeCache: defineTable({
        key: v.string(), // e.g., 'airing_anime_page_1', 'recent_manga_page_1'
        data: v.any(),
        updatedAt: v.number(),
    }).index('by_key', ['key']),
    videoSeries: defineTable({
        uid: v.id('users'),
        title: v.string(), 
        animeId: v.optional(v.number()),
        createdAt: v.number(),
    }).index('by_uid', ['uid']),
})