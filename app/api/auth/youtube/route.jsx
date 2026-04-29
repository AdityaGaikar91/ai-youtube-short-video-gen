import { NextResponse } from "next/server";

const YOUTUBE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('uid');

    if (!userId) {
        return NextResponse.json({ error: 'uid required' }, { status: 400 });
    }

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
        ].join(' '),
        access_type: 'offline',
        prompt: 'consent',   // Force refresh_token every time
        state: userId,       // Pass uid through OAuth state
    });

    return NextResponse.redirect(`${YOUTUBE_OAUTH_URL}?${params.toString()}`);
}
