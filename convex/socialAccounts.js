import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upsert a social account connection (create or update if platform already connected)
export const UpsertSocialAccount = mutation({
    args: {
        uid: v.id('users'),
        platform: v.string(),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.optional(v.number()),
        platformUserId: v.string(),
        platformUsername: v.string(),
        platformAvatarUrl: v.optional(v.string()),
        pageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('userSocialAccounts')
            .withIndex('by_uid_platform', q => q.eq('uid', args.uid).eq('platform', args.platform))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt: args.expiresAt,
                platformUserId: args.platformUserId,
                platformUsername: args.platformUsername,
                platformAvatarUrl: args.platformAvatarUrl,
                pageId: args.pageId,
                isActive: true,
            });
            return existing._id;
        }

        return await ctx.db.insert('userSocialAccounts', {
            uid: args.uid,
            platform: args.platform,
            accessToken: args.accessToken,
            refreshToken: args.refreshToken,
            expiresAt: args.expiresAt,
            platformUserId: args.platformUserId,
            platformUsername: args.platformUsername,
            platformAvatarUrl: args.platformAvatarUrl,
            pageId: args.pageId,
            connectedAt: Date.now(),
            isActive: true,
        });
    }
});

// Disconnect (deactivate) a social account — clears tokens, keeps record
export const DisconnectSocialAccount = mutation({
    args: {
        uid: v.id('users'),
        platform: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('userSocialAccounts')
            .withIndex('by_uid_platform', q => q.eq('uid', args.uid).eq('platform', args.platform))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isActive: false,
                accessToken: '',
                refreshToken: undefined,
            });
        }
    }
});

// Get all active social accounts for a user
export const GetUserSocialAccounts = query({
    args: { uid: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('userSocialAccounts')
            .withIndex('by_uid', q => q.eq('uid', args.uid))
            .filter(q => q.eq(q.field('isActive'), true))
            .collect();
    }
});

// Get a specific platform connection for a user
export const GetSocialAccountByPlatform = query({
    args: { uid: v.id('users'), platform: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('userSocialAccounts')
            .withIndex('by_uid_platform', q => q.eq('uid', args.uid).eq('platform', args.platform))
            .unique();
    }
});

// Update tokens after refresh (called by Inngest token refresh job)
export const UpdateSocialAccountTokens = mutation({
    args: {
        accountId: v.id('userSocialAccounts'),
        accessToken: v.string(),
        expiresAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.accountId, {
            accessToken: args.accessToken,
            expiresAt: args.expiresAt,
        });
    }
});

// Get all active accounts expiring within the next N milliseconds (used by token refresh job)
// TODO: Add .index('by_expires_at', ['isActive', 'expiresAt']) for scale
export const GetExpiringAccounts = query({
    args: {
        withinMs: v.number(), // e.g. 7 * 24 * 60 * 60 * 1000 for 7 days
    },
    handler: async (ctx, args) => {
        const threshold = Date.now() + args.withinMs;

        const allActive = await ctx.db
            .query('userSocialAccounts')
            .filter(q => q.eq(q.field('isActive'), true))
            .collect();

        return allActive.filter(account =>
            account.expiresAt !== undefined &&
            account.expiresAt <= threshold
        );
    }
});
