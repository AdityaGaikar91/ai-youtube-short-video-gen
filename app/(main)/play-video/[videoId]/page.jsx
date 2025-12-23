"use client"
import React, { useEffect, useState } from 'react'
import RemotionPlayer from '../_components/RemotionPlayer'
import VideoInfo from '../_components/VideoInfo'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import AnimeWrapper from '@/app/_components/AnimeWrapper';

function PlayVideo() {

    const {videoId} = useParams();
    const convex = useConvex();
    const [videoData, setVideoData] = useState();

    useEffect(() => {
        videoId && GetVideoDataById();
    }, [videoId])

    const GetVideoDataById = async() => {
        const result = await convex.query(api.videoData.GetVideoById,{
            videoId:videoId
        });
        console.log(result);
        setVideoData(result);
    }

  return (
    <AnimeWrapper animation="fadeIn" duration={800} className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <AnimeWrapper animation="slideUp" duration={1000} delay={200}>
            {/* Remotion Player */}
            <RemotionPlayer videoData={videoData}/>
        </AnimeWrapper>
        <AnimeWrapper animation="slideUp" duration={1000} delay={400}>
            {/* Video Information */}
            <VideoInfo videoData={videoData}/>
        </AnimeWrapper>
    </AnimeWrapper>
  )
}

export default PlayVideo