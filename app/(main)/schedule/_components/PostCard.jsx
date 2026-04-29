"use client"
import React from 'react';
import { Clock, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

const STATUS_STYLES = {
    pending: 'bg-amber-500/20 text-amber-400',
    uploading: 'bg-blue-500/20 text-blue-400 animate-pulse',
    success: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
};

const PLATFORM_COLORS = {
    youtube: 'bg-red-500',
    instagram: 'bg-gradient-to-r from-pink-500 to-orange-400',
};

export default function PostCard({ post, onReschedule }) {
    const [showConfirm, setShowConfirm] = React.useState(false);
    const cancelPost = useMutation(api.scheduledPosts.CancelScheduledPost);

    const formattedDate = new Date(post.scheduledFor).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });
    const formattedTime = new Date(post.scheduledFor).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });

    const handleCancel = async () => {
        try {
            await cancelPost({ postId: post._id });
            toast.success("Post cancelled");
            setShowConfirm(false);
        } catch (error) {
            toast.error(error.message || "Failed to cancel");
        }
    };

    return (
        <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${PLATFORM_COLORS[post.platform] || 'bg-gray-500'}`} />
                    <div className="min-w-0">
                        <h3 className="text-white font-medium truncate">{post.videoTitle}</h3>
                        <p className="text-sm text-gray-400 capitalize">{post.platform}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[post.status] || STATUS_STYLES.pending}`}>
                        {post.status}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDate} at {formattedTime}</span>
            </div>

            {post.caption && (
                <p className="mt-2 text-sm text-gray-500 truncate">
                    {post.caption.length > 80 ? post.caption.slice(0, 80) + '...' : post.caption}
                </p>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
                {post.status === 'pending' && !showConfirm && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-400 hover:text-white"
                            onClick={() => onReschedule?.(post)}
                        >
                            <RefreshCw className="w-3 h-3 mr-1" /> Reschedule
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-400 hover:text-red-400"
                            onClick={() => setShowConfirm(true)}
                        >
                            <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                    </>
                )}

                {showConfirm && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Cancel this post?</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-400 hover:text-red-300"
                            onClick={handleCancel}
                        >
                            Yes, Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-400 hover:text-white"
                            onClick={() => setShowConfirm(false)}
                        >
                            No
                        </Button>
                    </div>
                )}

                {post.status === 'success' && post.uploadUrl && (
                    <a
                        href={post.uploadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" /> View Post
                    </a>
                )}

                {post.status === 'failed' && (
                    <span className="text-xs text-gray-500 italic">Retry coming soon</span>
                )}
            </div>
        </div>
    );
}
