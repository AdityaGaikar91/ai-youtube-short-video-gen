import { generateScript } from "@/configs/AiModel";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const SCRIPT_PROMPT=`write a two different script for 30 Seconds video on Topic:{topic},
Do not add Scene description
Do not Add Anything in Braces, Just return the plain story in text
Give me response in JSON format and follow the schema
-{
scripts:[
{
content:''
},
],
}`

export async function POST(req) {
    try {
        const {topic} = await req.json();
        
        const PROMPT = SCRIPT_PROMPT.replace('{topic}', topic);
        const result = await generateScript.sendMessage(PROMPT);
        const resp = result?.response?.text();
        // Clean the response from markdown formatting
        const cleanedResp = resp.replace(/```json|```/g, '').trim();
        
        return NextResponse.json(JSON.parse(cleanedResp));
    } catch (e) {
        const logPath = path.join(process.cwd(), 'debug.log');
        const logMessage = `\n[${new Date().toISOString()}] Error: ${e.message}\nStack: ${e.stack}\n`;
        fs.appendFileSync(logPath, logMessage);
        
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}