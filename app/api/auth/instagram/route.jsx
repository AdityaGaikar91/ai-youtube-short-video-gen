import { NextResponse } from "next/server";

// Instagram uses Facebook's OAuth dialog
const FB_OAUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('uid');

    if (!userId) {
        return NextResponse.json({ error: 'uid required' }, { status: 400 });
    }

    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
        scope: [
            'instagram_basic',
            'instagram_content_publish',
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
        ].join(','),
        response_type: 'code',
        state: userId,
    });

    return NextResponse.redirect(`${FB_OAUTH_URL}?${params.toString()}`);
}
