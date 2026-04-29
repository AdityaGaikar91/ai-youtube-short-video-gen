"use client"
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Youtube, Instagram, Clock, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';

const statusConfig = {
    pending: {
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10 border-gray-500/20',
        icon: Clock,
        label: 'Pending',
    },
    uploading: {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        icon: Loader2,
        label: 'Uploading',
        animate: true,
    },
    success: {
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle2,
        label: 'Published',
    },
    failed: {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20',
        icon: XCircle,
        label: 'Failed',
    },
    cancelled: {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        icon: XCircle,
        label: 'Cancelled',
    },
};

const platformIcons = {
    youtube: { icon: Youtube, color: 'text-red-400' },
    instagram: { icon: Instagram, color: 'text-pink-400' },
};

function formatScheduleTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function ScheduleStatusQueue({ videoId }) {
    const schedules = useQuery(
        api.scheduledPosts.GetPostSchedules,
        videoId ? { videoId } : "skip"
    );

    if (!schedules || schedules.length === 0) return null;

    return (
        <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Scheduled Posts
            </h3>
            <div className="space-y-2">
                {schedules.map((schedule) => {
                    const status = statusConfig[schedule.status] || statusConfig.pending;
                    const platform = platformIcons[schedule.platform];
                    const StatusIcon = status.icon;
                    const PlatformIcon = platform?.icon;

                    return (
                        <div
                            key={schedule._id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${status.bgColor} transition-all duration-300`}
                        >
                            <div className="flex items-center gap-3">
                                {PlatformIcon && (
                                    <PlatformIcon className={`w-5 h-5 ${platform.color}`} />
                                )}
                                <div>
                                    <p className="text-sm text-white font-medium capitalize">
                                        {schedule.platform}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatScheduleTime(schedule.scheduledFor)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusIcon
                                    className={`w-4 h-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`}
                                />
                                <span className={`text-xs font-medium ${status.color}`}>
                                    {status.label}
                                </span>

                                {schedule.status === 'success' && schedule.uploadUrl && (
                                    <a
                                        href={schedule.uploadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}

                                {schedule.status === 'failed' && schedule.error && (
                                    <span className="text-xs text-red-300/70 max-w-[120px] truncate" title={schedule.error}>
                                        {schedule.error}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
