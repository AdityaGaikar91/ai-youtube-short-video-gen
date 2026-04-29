"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const COMMON_TIMEZONES = [
    'Asia/Kolkata',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland',
];

export default function RecurringScheduleModal({ isOpen, onOpenChange, userId, accounts }) {
    const [platform, setPlatform] = useState('youtube');
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [time, setTime] = useState('09:00');
    const [timezone, setTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createSchedule = useMutation(api.recurringSchedules.CreateRecurringSchedule);

    const hasYoutube = accounts?.some(acc => acc.platform === 'youtube' && acc.isActive);
    const hasInstagram = accounts?.some(acc => acc.platform === 'instagram' && acc.isActive);

    const handleSubmit = async () => {
        if (!userId) {
            toast.error("User session not loaded. Please wait.");
            return;
        }
        const [hour, minute] = time.split(':').map(Number);
        setIsSubmitting(true);
        try {
            await createSchedule({
                uid: userId,
                platform,
                dayOfWeek,
                hour,
                minute,
                timezone,
            });
            toast.success("Recurring schedule created!");
            onOpenChange(false);
        } catch (error) {
            toast.error(error.message || "Failed to create schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] border border-white/20 bg-black/90 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">New Recurring Schedule</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Auto-post your next video on a recurring cadence.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    {/* Platform */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Platform</Label>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant={platform === 'youtube' ? 'default' : 'outline'}
                                size="sm"
                                disabled={!hasYoutube}
                                onClick={() => setPlatform('youtube')}
                                className={platform === 'youtube'
                                    ? 'bg-red-600 hover:bg-red-700 text-white border-none'
                                    : 'border-white/20 text-gray-400 hover:text-white'
                                }
                            >
                                YouTube
                            </Button>
                            <Button
                                type="button"
                                variant={platform === 'instagram' ? 'default' : 'outline'}
                                size="sm"
                                disabled={!hasInstagram}
                                onClick={() => setPlatform('instagram')}
                                className={platform === 'instagram'
                                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white border-none'
                                    : 'border-white/20 text-gray-400 hover:text-white'
                                }
                            >
                                Instagram
                            </Button>
                        </div>
                    </div>

                    {/* Day of Week */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Day of Week</Label>
                        <select
                            value={dayOfWeek}
                            onChange={(e) => setDayOfWeek(Number(e.target.value))}
                            className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {DAYS_OF_WEEK.map(d => (
                                <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Time</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                        />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Timezone</Label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {COMMON_TIMEZONES.map(tz => (
                                <option key={tz} value={tz} className="bg-gray-900">{tz}</option>
                            ))}
                        </select>
                    </div>
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
                        disabled={isSubmitting || !userId}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 border-none"
                    >
                        {!userId ? "Loading User..." : isSubmitting ? "Creating..." : "Create Schedule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
