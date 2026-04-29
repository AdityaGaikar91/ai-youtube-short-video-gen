"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

export default function RescheduleModal({ isOpen, onOpenChange, post }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reschedulePost = useMutation(api.scheduledPosts.ReschedulePost);

    const currentDate = post ? new Date(post.scheduledFor) : null;
    const currentFormatted = currentDate
        ? `${currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
        : '';

    const isValid = date && time && new Date(`${date}T${time}`).getTime() > Date.now();

    const handleSubmit = async () => {
        const newTimestamp = new Date(`${date}T${time}`).getTime();
        setIsSubmitting(true);
        try {
            await reschedulePost({
                postId: post._id,
                newScheduledFor: newTimestamp,
            });
            toast.success("Post rescheduled!");
            onOpenChange(false);
        } catch (error) {
            toast.error(error.message || "Failed to reschedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border border-white/20 bg-black/90 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="text-lg">Reschedule Post</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label className="text-gray-500 text-xs">Currently scheduled for</Label>
                        <p className="text-sm text-gray-300">{currentFormatted}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">New Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">New Time</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                        />
                    </div>

                    {date && time && !isValid && (
                        <p className="text-xs text-red-400">Cannot schedule in the past</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="border-white/20 text-gray-300 hover:text-white"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 border-none"
                    >
                        {isSubmitting ? "Rescheduling..." : "Reschedule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
