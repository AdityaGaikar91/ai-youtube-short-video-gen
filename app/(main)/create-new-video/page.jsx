"use client"
import React, { useState, Suspense } from 'react'
import Topic from './_components/Topic'
import VideoStyle from './_components/VideoStyle';
import Voice from './_components/Voice';
import Captions from './_components/Captions';
import { Button } from '@/components/ui/button';
import { Loader2Icon, WandSparkles } from 'lucide-react';
import Preview from './_components/Preview';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import AnimeWrapper from '@/app/_components/AnimeWrapper';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function CreateNewVideoContent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';

    const [formData, setFormData] = useState({
        topic: initialTopic
    });
    const CreateInitialaVideoRecord = useMutation(api.videoData.CreateVideoData);
    const CreateSeriesRecord = useMutation(api.videoData.CreateVideoSeries);
    const {user} = useAuthContext();
    const [loading, setLoading] = useState(false);

    const onHandleInputChange=(fieldName, fieldValue)=>{
        setFormData(prev=>({
            ...prev,
            [fieldName]:fieldValue
        }))
    }
    
  const GenerateVideo = async () => {
    const isSeries = formData.isSeries && formData.scripts?.length > 0;
    const requiredCredits = isSeries ? formData.scripts.length : 1;

    if (user?.credits < requiredCredits) {
      toast.error(`Please add more credits! You need ${requiredCredits} credits for this series.`);
      return;
    }

    if (!formData?.topic || (!isSeries && !formData?.script) || !formData.videoStyle || !formData?.caption || !formData?.voice) {
      toast.error('Please fill in all fields before generating.');
      return;
    }

    setLoading(true);
    try {
      if (isSeries) {
        // Create Series Record
        const seriesId = await CreateSeriesRecord({
          uid: user?._id,
          title: formData.seriesTitle || formData.topic,
          animeId: formData.animeId // If available from browser
        });

        // Generate all parts in parallel
        await Promise.all(formData.scripts.map(async (part) => {
          const resp = await CreateInitialaVideoRecord({
            title: `${formData.seriesTitle || formData.topic} - Part ${part.partNumber}`,
            topic: formData.topic,
            script: part.content,
            videoStyle: formData.videoStyle,
            caption: formData.caption,
            voice: formData.voice,
            uid: user?._id,
            createdBy: user?.email,
            credits: user?.credits,
            seriesId: seriesId,
            partNumber: part.partNumber
          });

          return axios.post('/api/generate-video-data', {
            ...formData,
            script: part.content,
            recordId: resp,
            animeId: formData.animeId
          });
        }));

        toast.success(`Started generating ${formData.scripts.length} parts for the series!`);
      } else {
        // Single Video
        const resp = await CreateInitialaVideoRecord({
          title: formData.title,
          topic: formData.topic,
          script: formData.script,
          videoStyle: formData.videoStyle,
          caption: formData.caption,
          voice: formData.voice,
          uid: user?._id,
          createdBy: user?.email,
          credits: user?.credits
        });

        await axios.post('/api/generate-video-data', {
          ...formData,
          recordId: resp,
        });

        toast.success('Video generation started! Check your dashboard.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error('GenerateVideo error:', err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <AnimeWrapper animation="fadeIn" duration={800}>
        <h2 className='text-3xl font-bold text-white mb-8 drop-shadow-md'>Create New Video</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <AnimeWrapper animation="slideUp" duration={1000} delay={200} className='col-span-2 p-7 border border-white/20 rounded-xl h-[72vh] overflow-auto backdrop-blur-xl bg-black/10 shadow-2xl scrollbar-hide'>
                {/* Topic & Script */}
                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                    <Topic onHandleInputChange={onHandleInputChange} initialValue={formData?.topic}/>
                </div>

                {/* Video Image Style */}
                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                    <VideoStyle onHandleInputChange={onHandleInputChange}/>
                </div>

                {/* Voice */}
                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                    <Voice onHandleInputChange={onHandleInputChange}/>
                </div>

                {/* Captions */}
                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                    <Captions onHandleInputChange={onHandleInputChange}/>
                </div>

                <AnimeWrapper hover>
                    <Button className="w-full mt-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white font-semibold transform hover:-translate-y-1"
                        disabled={loading}
                        onClick={GenerateVideo}
                    >{loading ? <Loader2Icon className='animate-spin' /> : <WandSparkles/>}Generate Video</Button>
                </AnimeWrapper>
                
            </AnimeWrapper>
            <AnimeWrapper animation="slideUp" duration={1000} delay={400} className="h-full">
                <div className='sticky top-24 border border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl bg-black/10'>
                     {/* Preview Container Glass Style */}
                     <div className="p-4 bg-white/5">
                        <Preview formData={formData}/>
                     </div>
                </div>
            </AnimeWrapper>
        </div>
       
    </AnimeWrapper>
  )
}

export default function CreateNewVideo() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <CreateNewVideoContent />
        </Suspense>
    )
}