"use client"
import React, { useEffect, useState } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuthContext } from '@/app/provider'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import AnimeWrapper from '@/app/_components/AnimeWrapper'
import { Button } from '@/components/ui/button'
import { Youtube, Instagram, CheckCircle2, XCircle, Loader2, Link2Off, ExternalLink } from 'lucide-react'
import { auth } from '@/configs/firebaseConfig'

const PLATFORMS = [
    {
        key: 'youtube',
        label: 'YouTube',
        icon: Youtube,
        color: 'from-red-600 to-red-700',
        borderColor: 'border-red-500/40',
        description: 'Upload Shorts directly to your YouTube channel',
        connectHref: (uid) => `/api/auth/youtube?uid=${uid}`,
    },
    {
        key: 'instagram',
        label: 'Instagram',
        icon: Instagram,
        color: 'from-pink-500 via-purple-500 to-indigo-500',
        borderColor: 'border-pink-500/40',
        description: 'Share Reels to your Instagram Business or Creator account',
        connectHref: (uid) => `/api/auth/instagram?uid=${uid}`,
    },
]

function PlatformCard({ platform, account, onDisconnect, userId }) {
    const Icon = platform.icon
    const isConnected = !!account
    const isExpiringSoon = account?.expiresAt &&
        (account.expiresAt - Date.now()) < 7 * 24 * 60 * 60 * 1000

    return (
        <div className={`relative p-6 rounded-2xl border bg-white/5 backdrop-blur-md shadow-xl transition-all hover:bg-white/[0.08] ${platform.borderColor}`}>
            {/* Platform Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.color} shadow-lg flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg">{platform.label}</h3>
                    <p className="text-white/50 text-sm leading-tight">{platform.description}</p>
                </div>
                <div className="flex-shrink-0">
                    {isConnected
                        ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                        : <XCircle className="w-6 h-6 text-white/30" />
                    }
                </div>
            </div>

            {/* Connected Account Info */}
            {isConnected ? (
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-3">
                        {account.platformAvatarUrl && (
                            <img
                                src={account.platformAvatarUrl}
                                alt={account.platformUsername}
                                className="w-10 h-10 rounded-full border-2 border-white/20 flex-shrink-0"
                            />
                        )}
                        <div className="min-w-0">
                            <p className="text-white font-semibold truncate">{account.platformUsername}</p>
                            <p className="text-white/40 text-xs">
                                Connected {new Date(account.connectedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {isExpiringSoon && (
                        <p className="mt-3 text-amber-400 text-xs flex items-center gap-1">
                            ⚠ Token expires soon — reconnect to continue uploading
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-black/10 rounded-xl p-4 border border-dashed border-white/10 mb-4 text-center">
                    <p className="text-white/40 text-sm">Not connected</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                {isConnected ? (
                    <>
                        <Button
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                            onClick={() => window.location.href = platform.connectHref(userId)}
                            disabled={!userId}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Reconnect
                        </Button>
                        <Button
                            variant="outline"
                            className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
                            onClick={() => onDisconnect(platform.key)}
                            disabled={!userId}
                        >
                            <Link2Off className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <Button
                        className={`w-full bg-gradient-to-r ${platform.color} text-white font-semibold hover:opacity-90 shadow-lg border-0`}
                        onClick={() => {
                            if (!userId) {
                                toast.error('User session not loaded. Please log in again.');
                                return;
                            }
                            window.location.href = platform.connectHref(userId);
                        }}
                        disabled={!userId}
                    >
                        {!userId ? 'Log in to Connect' : `Connect ${platform.label}`}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const { user } = useAuthContext()
    const searchParams = useSearchParams()
    const DisconnectAccount = useMutation(api.socialAccounts.DisconnectSocialAccount)
    
    // Reactive query for accounts
    const accounts = useQuery(api.socialAccounts.GetUserSocialAccounts, 
        user?._id ? { uid: user._id } : "skip"
    )

    const loading = accounts === undefined && user !== null
    
    console.log('Settings - User ID:', user?._id);
    console.log('Settings - Accounts:', accounts);

    // Handle OAuth redirect toast messages
    useEffect(() => {
        const connected = searchParams.get('connected')
        const error = searchParams.get('error')

        if (connected === 'youtube') toast.success('YouTube channel connected successfully!')
        if (connected === 'instagram') toast.success('Instagram account connected successfully!')
        if (error === 'youtube_denied') toast.error('YouTube connection was cancelled.')
        if (error === 'youtube_token') toast.error('Failed to get YouTube access token. Please try again.')
        if (error === 'youtube_no_channel') toast.error('No YouTube channel found on this account.')
        if (error === 'youtube_server') toast.error('YouTube connection failed. Please try again.')
        if (error === 'instagram_denied') toast.error('Instagram connection was cancelled.')
        if (error === 'instagram_no_business') toast.error('Instagram account must be a Business or Creator account linked to a Facebook Page.')
        if (error === 'instagram_no_page') toast.error('No Facebook Page found. Link a Page to your Instagram account first.')
        if (error === 'instagram_token') toast.error('Failed to get Instagram access token. Please try again.')
        if (error === 'instagram_server') toast.error('Instagram connection failed. Please try again.')
    }, [searchParams])

    const handleDisconnect = async (platform) => {
        try {
            await DisconnectAccount({ uid: user._id, platform })
            toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected.`)
        } catch (err) {
            toast.error('Failed to disconnect. Please try again.')
        }
    }

    const getAccount = (platform) => accounts?.find(a => a.platform === platform)

    return (
        <AnimeWrapper animation="fadeIn" duration={800}>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Settings</h2>
                    <p className="text-white/50">Manage your connected social accounts for automatic posting</p>
                </div>
                <Button 
                    variant="outline" 
                    className="border-white/10 text-white/70 hover:bg-white/10 bg-transparent"
                    onClick={() => {
                        auth.signOut();
                        window.location.href = '/';
                    }}
                >
                    Sign Out
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                    {PLATFORMS.map(platform => (
                        <AnimeWrapper key={platform.key} animation="slideUp" duration={800}>
                            <PlatformCard
                                platform={platform}
                                account={getAccount(platform.key)}
                                onDisconnect={handleDisconnect}
                                userId={user?._id}
                            />
                        </AnimeWrapper>
                    ))}
                </div>
            )}

            {/* Info section */}
            <div className="mt-10 max-w-3xl">
                <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h3 className="text-white font-semibold mb-2">📋 Requirements</h3>
                    <ul className="text-white/50 text-sm space-y-1 list-disc list-inside">
                        <li>YouTube: Any standard YouTube channel account</li>
                        <li>Instagram: Must be a <strong className="text-white/70">Business or Creator</strong> account linked to a Facebook Page</li>
                        <li>Connected accounts are used for direct video uploads when you schedule posts</li>
                    </ul>
                </div>
            </div>
        </AnimeWrapper>
    )
}
