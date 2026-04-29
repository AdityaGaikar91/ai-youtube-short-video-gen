"use client"
import React, { useMemo } from 'react';
import PostCard from './PostCard';
import Link from 'next/link';
import { CalendarX } from 'lucide-react';

function getDateLabel(dateStr) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
}

export default function ScheduleList({ posts, statusFilter, onReschedule }) {
    const filteredPosts = useMemo(() => {
        if (!posts) return [];
        if (statusFilter === 'all') return posts;
        return posts.filter(p => p.status === statusFilter);
    }, [posts, statusFilter]);

    const grouped = useMemo(() => {
        const groups = {};
        filteredPosts.forEach(post => {
            const dateKey = new Date(post.scheduledFor).toDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(post);
        });
        return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
    }, [filteredPosts]);

    if (grouped.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <CalendarX className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg text-gray-400 mb-2">No scheduled posts yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Create a video and schedule it from the playback page
                </p>
                <Link href="/dashboard" className="text-sm text-primary hover:underline">
                    Go to Dashboard →
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {grouped.map(([dateKey, datePosts]) => (
                <div key={dateKey}>
                    <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-sm py-2 mb-3">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                            {getDateLabel(dateKey)}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {datePosts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onReschedule={onReschedule}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
