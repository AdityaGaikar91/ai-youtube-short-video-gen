import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateRecurringSchedule = mutation({
    args: {
        uid: v.id('users'),
        platform: v.string(),
        dayOfWeek: v.number(),
        hour: v.number(),
        minute: v.number(),
        timezone: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('recurringSchedules', {
            ...args,
            isActive: true,
            createdAt: Date.now(),
        });
    }
});

export const GetUserRecurringSchedules = query({
    args: { uid: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('recurringSchedules')
            .withIndex('by_uid', q => q.eq('uid', args.uid))
            .collect();
    }
});

export const GetActiveSchedules = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query('recurringSchedules')
            .withIndex('by_active', q => q.eq('isActive', true))
            .collect();
    }
});

export const ToggleRecurringSchedule = mutation({
    args: { scheduleId: v.id('recurringSchedules') },
    handler: async (ctx, args) => {
        const schedule = await ctx.db.get(args.scheduleId);
        if (!schedule) throw new Error('Schedule not found');
        await ctx.db.patch(args.scheduleId, { isActive: !schedule.isActive });
    }
});

export const DeleteRecurringSchedule = mutation({
    args: { scheduleId: v.id('recurringSchedules') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.scheduleId);
    }
});

export const UpdateLastTriggered = mutation({
    args: { scheduleId: v.id('recurringSchedules') },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.scheduleId, { lastTriggeredAt: Date.now() });
    }
});
