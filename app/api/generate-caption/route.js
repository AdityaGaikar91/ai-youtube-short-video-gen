import { GenerateSocialCaption } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { script, platform } = await req.json();
        
        if (!script || !platform) {
            return NextResponse.json({ success: false, error: "Missing script or platform" }, { status: 400 });
        }
        
        const prompt = `Script: ${script}\nPlatform: ${platform}`;
        
        const result = await GenerateSocialCaption.generateContent(prompt);
        const responseData = JSON.parse(result.response.text());
        
        return NextResponse.json({ success: true, data: responseData });
    } catch (e) {
        console.error("Caption generation error:", e);
        return NextResponse.json({ success: false, error: "Failed to generate caption" }, { status: 500 });
    }
}
