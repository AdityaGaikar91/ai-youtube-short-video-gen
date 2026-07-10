"use client"
import { useAuthContext } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { RefreshCcw } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import AnimeWrapper from '@/app/_components/AnimeWrapper';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

function VideoList() {
    const [videoList, setVideoList] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const convex = useConvex();
    const {user} = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [scheduling, setScheduling] = useState(null); // ID of series being scheduled

    const bulkSchedule = useMutation(api.scheduledPosts.BulkCreateSchedules);

    useEffect(() => {
        user && GetUserVideoList();
    },[user])

    const GetUserVideoList = async() => {
        setLoading(true);
        // All user videos
        const result = await convex.query(api.videoData.GetUserVideo,{
            uid:user?._id
        });
        
        // All user series
        const series = await convex.query(api.videoData.GetUserSeries, {
            uid: user?._id
        });

        // Filter out videos that are part of a series for the main list
        const soloVideos = result.filter(v => !v.seriesId);
        setVideoList(soloVideos);

        // For each series, fetch its videos
        const seriesWithVideos = await Promise.all(series.map(async (s) => {
            const vids = await convex.query(api.videoData.GetSeriesVideos, { seriesId: s._id });
            return { ...s, videos: vids };
        }));
        setSeriesList(seriesWithVideos);

        setLoading(false);

        // Poll for any pending videos (solo or in series)
        const allVideos = [...result];
        const isPendingVideo = allVideos.find((item) => item.status == 'pending');
        isPendingVideo && GetPendingVideoStatus(isPendingVideo);
    }

    const GetPendingVideoStatus = (pendingVideo) =>{
        const intervalId = setInterval(async()=>{
            //Get Video Data by Id
            const result = await convex.query(api.videoData.GetVideoById,{
                videoId: pendingVideo?._id
            })
            
            if(result?.status == 'completed')
            {
                clearInterval(intervalId);
                GetUserVideoList();
            }

        },5000)
    }

    const handleBulkSchedule = async (series) => {
        const completedVideos = series.videos.filter(v => v.status === 'completed');
        if (completedVideos.length === 0) {
            toast.error("No completed videos to schedule!");
            return;
        }

        setScheduling(series._id);
        try {
            // Schedule 1 video every 24 hours starting tomorrow
            const posts = completedVideos.map((v, i) => ({
                videoId: v._id,
                platform: 'youtube',
                scheduledFor: Date.now() + (i + 1) * 24 * 60 * 60 * 1000,
                caption: v.title,
                tags: v.topic
            }));

            const scheduleIds = await bulkSchedule({
                uid: user._id,
                posts
            });

            // Trigger Inngest events
            const payload = posts.map((p, i) => ({
                scheduleId: scheduleIds[i],
                videoId: p.videoId,
                platform: p.platform,
                scheduledFor: p.scheduledFor,
                uid: user._id
            }));

            await axios.post('/api/schedule-post', payload);

            toast.success(`Successfully scheduled ${completedVideos.length} videos to YouTube!`);
        } catch (err) {
            console.error("Bulk schedule error:", err);
            toast.error("Failed to schedule series.");
        } finally {
            setScheduling(null);
        }
    }

  return (
    <div>
        {(!loading) && videoList?.length === 0 && seriesList?.length === 0 ?
        <div className='flex flex-col items-center 
        justify-center mt-28 gap-5 p-5 border border-dashed border-orange-100 rounded-xl py-16'>
            <Image src={'/logo.svg'} alt='logo' width={60} height={60}/>
            <h2 className='text-gray-400 text-lg'>You don't have any video created. Create new one</h2>
            <Link href={'/create-new-video'}>
            <Button>+ Create New</Button>
            </Link>
        </div>
        :
        <div className='mt-10 space-y-12'>
            {/* Series Section */}
            {seriesList?.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-300 border-l-4 border-purple-500 pl-4">Anime Series</h3>
                    </div>
                    {seriesList.map((series, sIndex) => (
                        <div key={series._id} className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-white">{series.title}</h4>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-2 border-purple-500/50 hover:bg-purple-500/20 text-purple-300"
                                    onClick={() => handleBulkSchedule(series)}
                                    disabled={scheduling === series._id}
                                >
                                    {scheduling === series._id ? (
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CalendarDays className="w-4 h-4" />
                                    )}
                                    Quick Schedule Series
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                {series.videos?.map((video, vIndex) => (
                                    <AnimeWrapper key={video._id} animation="scaleIn" duration={500} delay={vIndex * 100} hover>
                                        <Link href={'/play-video/'+video?._id}>
                                            <div className='relative group overflow-hidden rounded-xl border border-white/10 shadow-md transition-all hover:shadow-xl hover:border-white/30'>
                                                {video?.status == 'completed' ? (
                                                    <Image src={video?.images?.[0] || '/placeholder.svg'} 
                                                        alt={video?.title}
                                                        width={500}
                                                        height={500}
                                                        className='w-full object-cover rounded-xl aspect-[2/3]'
                                                    />
                                                ) : (
                                                    <div className='aspect-[2/3] p-5 w-full rounded-xl bg-slate-900/50 backdrop-blur-sm flex items-center justify-center gap-2'>
                                                        <RefreshCcw className='animate-spin text-primary'/>
                                                        <h2 className='text-gray-300 text-xs'>Part {video.partNumber}...</h2>
                                                    </div>
                                                )}
                                                <div className='absolute top-2 left-2 px-2 py-1 bg-purple-600/80 rounded text-[10px] font-bold text-white uppercase'>
                                                    Part {video.partNumber}
                                                </div>
                                                <div className='absolute bottom-0 px-5 py-3 w-full bg-black/60 backdrop-blur-md text-white transition-transform transform translate-y-full group-hover:translate-y-0 duration-300'>
                                                    <h2 className='font-bold text-sm truncate'>{video?.title}</h2>
                                                    <h2 className='text-[10px] text-gray-300'>{ moment(video?._creationTime).fromNow()}</h2>
                                                </div>
                                            </div>
                                        </Link>
                                    </AnimeWrapper>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Solo Videos Section */}
            <div className="space-y-6">
                {seriesList?.length > 0 && <h3 className="text-xl font-semibold text-gray-300 border-l-4 border-pink-500 pl-4">Individual Shorts</h3>}
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5'>
                    {videoList?.map((video, index) => (
                        <AnimeWrapper key={index} animation="scaleIn" duration={500} delay={index * 100} hover>
                        <Link href={'/play-video/'+video?._id}>
                        <div className='relative group overflow-hidden rounded-xl border border-white/10 shadow-md transition-all hover:shadow-xl hover:border-white/30'>
                        {video?.status == 'completed' ? <Image src={video?.images?.[0] || '/placeholder.svg'} 
                            alt={video?.title}
                            width={500}
                            height={500}
                            className='w-full object-cover rounded-xl aspect-[2/3]'
                            />:
                            <div className='aspect-[2/3] p-5 w-full rounded-xl bg-slate-900/50 backdrop-blur-sm flex items-center justify-center gap-2'>
                                <RefreshCcw className='animate-spin text-primary'/>
                                <h2 className='text-gray-300'>Generating...</h2>
                            </div>}
                            <div className='absolute bottom-0 px-5 py-3 w-full bg-black/60 backdrop-blur-md text-white transition-transform transform translate-y-full group-hover:translate-y-0 duration-300'>
                                <h2 className='font-bold text-lg truncate'>{video?.title}</h2>
                                <h2 className='text-xs text-gray-300'>{ moment(video?._creationTime).fromNow()}</h2>
                            </div>
                        </div>
                        </Link>
                        </AnimeWrapper>
                    ))}
                </div>
            </div>
        </div>
        }
    </div>
  )
}

export default VideoList