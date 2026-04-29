import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function generateMetadata({ params }) {
  const { videoId } = await params;
  
  try {
    const video = await fetchQuery(api.videoData.GetVideoById, { videoId });

    if (!video) {
      return {
        title: "Video Not Found | Genvid",
      };
    }

    return {
      title: `${video.title} | Genvid AI`,
      description: `Watch this AI-generated video about ${video.topic}. Created with Genvid.`,
      openGraph: {
        title: video.title,
        description: video.topic,
        images: video.images && video.images.length > 0 ? [video.images[0]] : [],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: video.title,
        description: video.topic,
        images: video.images && video.images.length > 0 ? [video.images[0]] : [],
      }
    };
  } catch (error) {
    return {
      title: "Watch Video | Genvid",
    };
  }
}

export default function PlayVideoLayout({ children }) {
  return <>{children}</>;
}
