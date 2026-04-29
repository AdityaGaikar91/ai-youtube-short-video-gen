import { generateScript } from "@/configs/AiModel";
import { NextResponse } from "next/server";

const SERIES_SCRIPT_PROMPT = `Write a 4-part sequential script series for a 30-second video on the Topic: {topic}.
Each part should be a distinct video script that follows the previous one.
Part 1: The Hook & Setup.
Part 2: The Rising Action & Development.
Part 3: The Climax & Key Highlight.
Part 4: The Resolution & Outro.

Rules:
1. Do not add Scene description.
2. Do not Add Anything in Braces.
3. Just return the scripts in the specified JSON format.
4. Keep each script under 75 words.
5. Make sure the transition between parts is seamless.

Format:
{
  "seriesTitle": "{topic}",
  "parts": [
    { "partNumber": 1, "content": "..." },
    { "partNumber": 2, "content": "..." },
    { "partNumber": 3, "content": "..." },
    { "partNumber": 4, "content": "..." }
  ]
}`;

export async function POST(req) {
    try {
        const { topic } = await req.json();
        
        const PROMPT = SERIES_SCRIPT_PROMPT.replace(/{topic}/g, topic);
        const result = await generateScript.sendMessage(PROMPT);
        const resp = result?.response?.text();
        
        // Clean and parse
        const cleanedResp = resp.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedResp);
        
        return NextResponse.json(parsed);
    } catch (e) {
        console.error("Series Script Generation Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
