import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const payload = await req.json();
        
        // Support both single object and array of objects for bulk scheduling
        const items = Array.isArray(payload) ? payload : [payload];

        if (items.length === 0) {
             return NextResponse.json(
                { success: false, error: "Empty payload" },
                { status: 400 }
            );
        }

        // Send events for each item
        const events = items.map(item => ({
            name: "post.scheduled",
            data: { 
                scheduleId: item.scheduleId, 
                videoId: item.videoId, 
                platform: item.platform, 
                scheduledFor: item.scheduledFor, 
                uid: item.uid 
            },
        }));

        await inngest.send(events);

        return NextResponse.json({ success: true, count: items.length });
    } catch (e) {
        console.error("Schedule trigger error:", e);
        return NextResponse.json(
            { success: false, error: "Failed to trigger scheduled upload" },
            { status: 500 }
        );
    }
}
