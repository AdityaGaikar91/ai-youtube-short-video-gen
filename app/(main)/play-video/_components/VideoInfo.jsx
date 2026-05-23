"use client"
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon } from 'lucide-react'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import AnimeWrapper from '@/app/_components/AnimeWrapper';
import { toast } from 'sonner';

function VideoInfo({videoData}) {

  const handleDownload = async () => {
    if (!videoData?.downloadUrl) {
      toast.error('Video is still processing. Please check back shortly.');
      return;
    }
    try {
      const response = await fetch(videoData.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoData.title || 'genvid-video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (err) {
      toast.error('Download failed. Please try again.');
    }
  };

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

        <div className="grid grid-cols-1 gap-4 mt-5">
            <AnimeWrapper hover>
                <Button
                  className="w-full"
                  onClick={handleDownload}
                  disabled={!videoData?.downloadUrl}
                >
                  <DownloadIcon/> {videoData?.downloadUrl ? 'Export' : 'Processing...'}
                </Button>
            </AnimeWrapper>
        </div>
      </div>
    </div>
  );
}

export default VideoInfo