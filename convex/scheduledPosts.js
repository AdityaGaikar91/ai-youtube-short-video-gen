import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateSchedule = mutation({
    args: {
        uid: v.id('users'),
        videoId: v.id('videoData'),
        platform: v.string(),
        scheduledFor: v.number(),
        caption: v.optional(v.string()),
        tags: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('scheduledPosts', {
            ...args,
            status: 'pending'
        });
    }
});

export const GetPostSchedules = query({
    args: { videoId: v.id('videoData') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('scheduledPosts')
            .withIndex('by_videoId', q => q.eq('videoId', args.videoId))
            .collect();
    }
});
