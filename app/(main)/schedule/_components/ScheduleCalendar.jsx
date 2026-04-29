"use client"
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PLATFORM_DOT = {
    youtube: 'bg-red-500',
    instagram: 'bg-pink-500',
};

export default function ScheduleCalendar({ posts, onDayClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const postsByDay = useMemo(() => {
        const map = {};
        if (!posts) return map;
        posts.forEach(post => {
            const d = new Date(post.scheduledFor);
            if (d.getMonth() === month && d.getFullYear() === year) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(post);
            }
        });
        return map;
    }, [posts, month, year]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const cells = [];
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="min-h-[80px] border border-white/5 rounded-lg opacity-30" />);
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const dayPosts = postsByDay[day] || [];
        const platforms = [...new Set(dayPosts.map(p => p.platform))];

        cells.push(
            <div
                key={day}
                onClick={() => dayPosts.length > 0 && onDayClick?.(new Date(year, month, day))}
                className={`min-h-[80px] border rounded-lg p-2 transition-all duration-150
                    ${isToday ? 'border-primary ring-1 ring-primary/40 bg-primary/5' : 'border-white/10 bg-white/5'}
                    ${dayPosts.length > 0 ? 'cursor-pointer hover:border-white/30' : ''}
                `}
            >
                <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-300'}`}>
                    {day}
                </span>
                {platforms.length > 0 && (
                    <div className="flex gap-1 mt-2">
                        {platforms.map(p => (
                            <div key={p} className={`w-2 h-2 rounded-full ${PLATFORM_DOT[p] || 'bg-gray-500'}`} />
                        ))}
                    </div>
                )}
                {dayPosts.length > 0 && (
                    <span className="text-[10px] text-gray-500 mt-1 block">
                        {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={prevMonth} className="text-gray-400 hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold text-white">{monthName}</h3>
                <Button variant="ghost" size="sm" onClick={nextMonth} className="text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells}
            </div>
        </div>
    );
}
