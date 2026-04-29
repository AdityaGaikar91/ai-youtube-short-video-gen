import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state');
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (error || !code || !userId || userId === 'undefined') {
        console.error('Invalid OAuth callback params:', { error, code, userId });
        return NextResponse.redirect(`${appUrl}/settings?error=youtube_denied`);
    }

    try {
        // Exchange code for tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${appUrl}/api/auth/youtube/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenRes.json();

        if (tokens.error) {
            console.error('YouTube token exchange error:', tokens.error);
            return NextResponse.redirect(`${appUrl}/settings?error=youtube_token`);
        }

        // Fetch the authenticated user's YouTube channel info
        const channelRes = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const channelData = await channelRes.json();
        const channel = channelData.items?.[0];

        if (!channel) {
            return NextResponse.redirect(`${appUrl}/settings?error=youtube_no_channel`);
        }

        console.log('Upserting social account for userId:', userId);
        // Save to Convex
        const result = await convex.mutation(api.socialAccounts.UpsertSocialAccount, {
            uid: userId,
            platform: 'youtube',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + (tokens.expires_in * 1000),
            platformUserId: channel.id,
            platformUsername: channel.snippet.title,
            platformAvatarUrl: channel.snippet.thumbnails?.default?.url,
        });
        console.log('Social account upsert result:', result);

        return NextResponse.redirect(`${appUrl}/settings?connected=youtube`);

    } catch (err) {
        console.error('YouTube OAuth callback error:', err);
        return NextResponse.redirect(`${appUrl}/settings?error=youtube_server`);
    }
}
