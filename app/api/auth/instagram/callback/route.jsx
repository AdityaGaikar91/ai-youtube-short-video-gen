import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const FB_GRAPH = 'https://graph.facebook.com/v19.0';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state');
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (error || !code || !userId) {
        return NextResponse.redirect(`${appUrl}/settings?error=instagram_denied`);
    }

    try {
        // Step 1: Exchange code for short-lived user access token
        const tokenRes = await fetch(`${FB_GRAPH}/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                redirect_uri: `${appUrl}/api/auth/instagram/callback`,
                code,
            }),
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error || !tokenData.access_token) {
            console.error('Instagram token error:', tokenData.error);
            return NextResponse.redirect(`${appUrl}/settings?error=instagram_token`);
        }

        // Step 2: Exchange short-lived token for long-lived token (~60 days)
        const longLivedRes = await fetch(
            `${FB_GRAPH}/oauth/access_token?` +
            new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: tokenData.access_token,
            })
        );
        const longLivedToken = await longLivedRes.json();
        const userAccessToken = longLivedToken.access_token || tokenData.access_token;
        const expiresAt = Date.now() + ((longLivedToken.expires_in || 5184000) * 1000);

        // Step 3: Get Facebook Pages linked to this account
        const pagesRes = await fetch(
            `${FB_GRAPH}/me/accounts?access_token=${userAccessToken}`
        );
        const pagesData = await pagesRes.json();
        const page = pagesData.data?.[0];

        if (!page) {
            return NextResponse.redirect(`${appUrl}/settings?error=instagram_no_page`);
        }

        // Step 4: Get the Instagram Business account linked to this Page
        const igRes = await fetch(
            `${FB_GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igRes.json();
        const igAccountId = igData.instagram_business_account?.id;

        if (!igAccountId) {
            return NextResponse.redirect(`${appUrl}/settings?error=instagram_no_business`);
        }

        // Step 5: Get Instagram account details
        const igInfoRes = await fetch(
            `${FB_GRAPH}/${igAccountId}?fields=username,profile_picture_url&access_token=${page.access_token}`
        );
        const igInfo = await igInfoRes.json();

        // Save to Convex — page token is used for content publishing
        await convex.mutation(api.socialAccounts.UpsertSocialAccount, {
            uid: userId,
            platform: 'instagram',
            accessToken: page.access_token,   // Page token — required for content publishing
            expiresAt,
            platformUserId: igAccountId,
            platformUsername: igInfo.username || 'Unknown',
            platformAvatarUrl: igInfo.profile_picture_url,
            pageId: page.id,
        });

        return NextResponse.redirect(`${appUrl}/settings?connected=instagram`);

    } catch (err) {
        console.error('Instagram OAuth callback error:', err);
        return NextResponse.redirect(`${appUrl}/settings?error=instagram_server`);
    }
}
