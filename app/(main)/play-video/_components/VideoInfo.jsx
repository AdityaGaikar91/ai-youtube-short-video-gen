import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon } from 'lucide-react'
import Link from 'next/link';
import React from 'react'
import AnimeWrapper from '@/app/_components/AnimeWrapper';

function VideoInfo({videoData}) {
  return (
    <div className='p-8 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md shadow-lg h-full'>
      <Link href={'/dashboard'}>
      <h2 className="flex gap-2 items-center text-primary mb-5 hover:text-primary/80 transition-colors cursor-pointer">
        <ArrowLeft />
        Back to Dashboard
      </h2>
      </Link>
      <div className='flex flex-col gap-4'>
        <h2 className="text-2xl font-bold text-white drop-shadow-sm">{videoData?.title}</h2>
        <div className='p-4 bg-black/20 rounded-lg border border-white/5'>
            <p className='text-gray-300 italic'>Script: {videoData?.script}</p>
        </div>
        <h2 className="text-lg text-gray-200">Video Style: <span className="font-semibold text-primary">{videoData?.videoStyle}</span></h2>

        <AnimeWrapper hover>
            <Button className="w-full mt-5"> <DownloadIcon/> Export & Download</Button>
        </AnimeWrapper>
      </div>
    </div>
  );
}

export default VideoInfo