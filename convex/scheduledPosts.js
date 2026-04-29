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

export const GetAllUserScheduledPosts = query({
    args: { uid: v.id('users') },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query('scheduledPosts')
            .withIndex('by_uid', q => q.eq('uid', args.uid))
            .order('asc')
            .collect();

        const enriched = await Promise.all(posts.map(async (post) => {
            const video = await ctx.db.get(post.videoId);
            return {
                ...post,
                videoTitle: video?.title || 'Untitled Video',
                videoStyle: video?.videoStyle || 'unknown',
            };
        }));

        return enriched;
    }
});

export const ReschedulePost = mutation({
    args: {
        postId: v.id('scheduledPosts'),
        newScheduledFor: v.number(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error('Post not found');
        if (post.status !== 'pending') throw new Error('Can only reschedule pending posts');
        if (args.newScheduledFor < Date.now()) throw new Error('Cannot schedule in the past');

        await ctx.db.patch(args.postId, { scheduledFor: args.newScheduledFor });
    }
});

export const CancelScheduledPost = mutation({
    args: { postId: v.id('scheduledPosts') },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error('Post not found');
        if (post.status !== 'pending') throw new Error('Can only cancel pending posts');

        await ctx.db.patch(args.postId, { status: 'cancelled' });
    }
});

export const UpdateScheduleStatus = mutation({
    args: {
        scheduleId: v.id('scheduledPosts'),
        status: v.string(),
        uploadUrl: v.optional(v.string()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.scheduleId, {
            status: args.status,
            ...(args.uploadUrl && { uploadUrl: args.uploadUrl }),
            ...(args.error && { error: args.error }),
        });
    }
});

export const BulkCreateSchedules = mutation({
    args: {
        uid: v.id('users'),
        posts: v.array(v.object({
            videoId: v.id('videoData'),
            platform: v.string(),
            scheduledFor: v.number(),
            caption: v.optional(v.string()),
            tags: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const post of args.posts) {
            const id = await ctx.db.insert('scheduledPosts', {
                uid: args.uid,
                ...post,
                status: 'pending'
            });
            ids.push(id);
        }
        return ids;
    }
});
