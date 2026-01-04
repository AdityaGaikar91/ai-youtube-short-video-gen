"use client"
import { useAuthContext } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { RefreshCcw } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import AnimeWrapper from '@/app/_components/AnimeWrapper';

function VideoList() {
    const [videoList, setVideoList] = useState([]);
    const convex = useConvex();
    const {user} = useAuthContext();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        user && GetUserVideoList();
    },[user])

    const GetUserVideoList = async() => {
        //All user videos
        const result = await convex.query(api.videoData.GetUserVideo,{
            uid:user?._id
        });
        setVideoList(result);
        const isPendingVideo = result?.find((item) => item.status == 'pending');
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
                console.log("Video Proccess Completed");
                GetUserVideoList();
            }
            console.log('Still Pending...')

        },5000)
    }

  return (
    <div>
        {(!loading) && videoList?.length == 0 ?
        <div className='flex flex-col items-center 
        justify-center mt-28 gap-5 p-5 border border-dashed border-orange-100 rounded-xl py-16'>
            <Image src={'/logo.svg'} alt='logo' width={60} height={60}/>
            <h2 className='text-gray-400 text-lg'>You don't have any video created. Create new one</h2>
            <Link href={'/create-new-video'}>
            <Button>+ Create New</Button>
            </Link>
        </div>
        :
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-10'>
            {videoList?.map((video, index) => (
                <AnimeWrapper key={index} animation="scaleIn" duration={500} delay={index * 100} hover>
                <Link href={'/play-video/'+video?._id}>
                <div className='relative group overflow-hidden rounded-xl border border-white/10 shadow-md transition-all hover:shadow-xl hover:border-white/30'>
                   {video?.status == 'completed' ? <Image src={video?.images[0]} 
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
        }
    </div>
  )
}

export default VideoList