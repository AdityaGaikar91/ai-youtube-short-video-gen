"use client"
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import ScheduleCalendar from './_components/ScheduleCalendar';
import ScheduleList from './_components/ScheduleList';
import RescheduleModal from './_components/RescheduleModal';
import RecurringScheduleModal from './_components/RecurringScheduleModal';
import { Button } from '@/components/ui/button';
import { CalendarDays, List, Plus, Pause, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'success', label: 'Completed' },
    { key: 'failed', label: 'Failed' },
];

const DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
    const { user } = useAuthContext();
    const [view, setView] = useState('list');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reschedulePost, setReschedulePost] = useState(null);
    const [showRecurringModal, setShowRecurringModal] = useState(false);

    const posts = useQuery(
        api.scheduledPosts.GetAllUserScheduledPosts,
        user?._id ? { uid: user._id } : "skip"
    );

    const accounts = useQuery(
        api.socialAccounts.GetUserSocialAccounts,
        user?._id ? { uid: user._id } : "skip"
    );

    const recurringSchedules = useQuery(
        api.recurringSchedules.GetUserRecurringSchedules,
        user?._id ? { uid: user._id } : "skip"
    );

    const toggleSchedule = useMutation(api.recurringSchedules.ToggleRecurringSchedule);
    const deleteSchedule = useMutation(api.recurringSchedules.DeleteRecurringSchedule);

    const handleToggle = async (scheduleId) => {
        try {
            await toggleSchedule({ scheduleId });
        } catch (error) {
            toast.error("Failed to update schedule");
        }
    };

    const handleDelete = async (scheduleId) => {
        try {
            await deleteSchedule({ scheduleId });
            toast.success("Schedule deleted");
        } catch (error) {
            toast.error("Failed to delete schedule");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Scheduled Posts</h1>
                    <p className="text-gray-400 mt-1">Manage your upcoming and past scheduled posts</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('list')}
                            className={`h-8 px-3 ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('calendar')}
                            className={`h-8 px-3 ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <CalendarDays className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {STATUS_FILTERS.map(f => (
                    <Button
                        key={f.key}
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter(f.key)}
                        className={`h-8 px-4 rounded-full text-sm whitespace-nowrap transition-all
                            ${statusFilter === f.key
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20'
                            }`}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            {/* Main Content */}
            {view === 'calendar' ? (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
                    <ScheduleCalendar posts={posts} onDayClick={(date) => {
                        setView('list');
                    }} />
                </div>
            ) : (
                <ScheduleList
                    posts={posts}
                    statusFilter={statusFilter}
                    onReschedule={(post) => setReschedulePost(post)}
                />
            )}

            {/* Recurring Schedules Section */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recurring Schedules</h2>
                    <Button
                        size="sm"
                        onClick={() => setShowRecurringModal(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 border-none"
                    >
                        <Plus className="w-4 h-4 mr-1" /> New
                    </Button>
                </div>

                {(!recurringSchedules || recurringSchedules.length === 0) ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                        <p className="text-gray-400">No recurring schedules yet.</p>
                        <p className="text-sm text-gray-500 mt-1">Create one to auto-post videos on a weekly cadence.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {recurringSchedules.map(schedule => (
                            <div
                                key={schedule._id}
                                className={`bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-200
                                    ${!schedule.isActive ? 'opacity-50' : 'hover:border-white/20'}
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                                            schedule.platform === 'youtube' ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-orange-400'
                                        }`} />
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Every {DAYS_LABELS[schedule.dayOfWeek]} at{' '}
                                                {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">{schedule.platform} · {schedule.timezone}</p>
                                        </div>
                                    </div>

                                    {!schedule.isActive && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                                            Paused
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-gray-400 hover:text-white"
                                        onClick={() => handleToggle(schedule._id)}
                                    >
                                        {schedule.isActive
                                            ? <><Pause className="w-3 h-3 mr-1" /> Pause</>
                                            : <><Play className="w-3 h-3 mr-1" /> Resume</>
                                        }
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-gray-400 hover:text-red-400"
                                        onClick={() => handleDelete(schedule._id)}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <RescheduleModal
                isOpen={!!reschedulePost}
                onOpenChange={(open) => { if (!open) setReschedulePost(null); }}
                post={reschedulePost}
            />

            <RecurringScheduleModal
                isOpen={showRecurringModal}
                onOpenChange={setShowRecurringModal}
                userId={user?._id}
                accounts={accounts}
            />
        </div>
    );
}
