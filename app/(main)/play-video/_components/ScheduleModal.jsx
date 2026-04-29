"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import { toast } from 'sonner';
import { Wand2 } from 'lucide-react';
import axios from 'axios';

export function ScheduleModal({ isOpen, onOpenChange, videoData, accounts }) {
    const { user } = useAuthContext();
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [caption, setCaption] = useState(videoData?.title || '');
    const [tags, setTags] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const createSchedule = useMutation(api.scheduledPosts.CreateSchedule);

    const hasYoutube = accounts?.some(acc => acc.platform === 'youtube' && acc.isActive);
    const hasInstagram = accounts?.some(acc => acc.platform === 'instagram' && acc.isActive);

    const handlePlatformToggle = (platform) => {
        if (selectedPlatforms.includes(platform)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
        } else {
            setSelectedPlatforms([...selectedPlatforms, platform]);
        }
    };

    const handleGenerateCaption = async () => {
        if (!videoData?.script) {
            toast.error("Video script not found for generation");
            return;
        }
        
        // Pick primary platform for context
        let targetPlatform = selectedPlatforms[0] || 'youtube';

        setIsGenerating(true);
        try {
            const response = await axios.post('/api/generate-caption', {
                script: videoData.script,
                platform: targetPlatform
            });

            if (response.data.success) {
                setCaption(response.data.data.caption || '');
                setTags(response.data.data.tags || '');
                toast.success("Caption generated!");
            } else {
                toast.error(response.data.error || "Failed to generate");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during generation");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSchedule = async () => {
        if (!date || !time) {
            toast.error("Please select both date and time");
            return;
        }
        if (selectedPlatforms.length === 0) {
            toast.error("Please select at least one platform");
            return;
        }

        const scheduledFor = new Date(`${date}T${time}`).getTime();
        
        if (scheduledFor < Date.now()) {
            toast.error("Cannot schedule in the past");
            return;
        }

        setIsScheduling(true);
        try {
            for (const platform of selectedPlatforms) {
                const scheduleId = await createSchedule({
                    uid: user._id,
                    videoId: videoData._id,
                    platform: platform,
                    scheduledFor: scheduledFor,
                    caption: caption,
                    tags: tags
                });

                // Trigger the Inngest background upload worker
                await axios.post('/api/schedule-post', {
                    scheduleId,
                    videoId: videoData._id,
                    platform,
                    scheduledFor,
                    uid: user._id,
                });
            }
            toast.success("Posts scheduled successfully!");
            onOpenChange(false);
            // Reset state
            setSelectedPlatforms([]);
            setDate('');
            setTime('');
            setTags('');
        } catch (error) {
            console.error('Failed to schedule:', error);
            toast.error("Failed to schedule post");
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border border-white/20 bg-black/90 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Schedule Post</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Select platforms and date/time to post your video automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex gap-4">
                        <div className="space-y-4">
                            <Label className="text-gray-300">Platforms</Label>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="youtube" 
                                        disabled={!hasYoutube} 
                                        checked={selectedPlatforms.includes('youtube')}
                                        onCheckedChange={() => handlePlatformToggle('youtube')}
                                    />
                                    <Label htmlFor="youtube" className={!hasYoutube ? "text-gray-500" : ""}>
                                        YouTube
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="instagram" 
                                        disabled={!hasInstagram}
                                        checked={selectedPlatforms.includes('instagram')}
                                        onCheckedChange={() => handlePlatformToggle('instagram')}
                                    />
                                    <Label htmlFor="instagram" className={!hasInstagram ? "text-gray-500" : ""}>
                                        Instagram
                                    </Label>
                                </div>
                                {(!hasYoutube && !hasInstagram) && (
                                    <p className="text-xs text-red-400 mt-1">Please connect accounts first.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <Label className="text-gray-300">Date & Time</Label>
                            <div className="flex flex-col gap-3">
                                <Input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                                <Input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-gray-300">Caption</Label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleGenerateCaption}
                                disabled={isGenerating}
                                className="h-8 text-xs text-purple-400 hover:text-purple-300"
                            >
                                <Wand2 className="w-3 h-3 mr-2" />
                                {isGenerating ? "Generating..." : "Auto Generate"}
                            </Button>
                        </div>
                        <Textarea 
                            className="bg-white/10 border-white/20 text-white min-h-[100px]" 
                            placeholder="Write your post caption here..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>
                                {caption.length} / {selectedPlatforms.includes('instagram') ? 2200 : selectedPlatforms.includes('youtube') ? 5000 : 2000} chars
                            </span>
                            {caption.length > (selectedPlatforms.includes('instagram') ? 2200 : selectedPlatforms.includes('youtube') ? 5000 : 2000) && (
                                <span className="text-red-400">Over character limit!</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Hashtags (Optional)</Label>
                        <Input 
                            className="bg-white/10 border-white/20 text-white" 
                            placeholder="#ai #shorts #viral"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSchedule} 
                        disabled={
                            isScheduling || 
                            selectedPlatforms.length === 0 || 
                            !date || 
                            !time ||
                            caption.length > (selectedPlatforms.includes('instagram') ? 2200 : selectedPlatforms.includes('youtube') ? 5000 : 2000)
                        }
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    >
                        {isScheduling ? "Scheduling..." : "Schedule Post"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
