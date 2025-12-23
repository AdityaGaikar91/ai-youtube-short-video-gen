"use client"
import React, { useState } from 'react'
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

function CreateNewVideo() {

    const [formData, setFormData] = useState();
    const CreateInitialaVideoRecord = useMutation(api.videoData.CreateVideoData);
    const {user} = useAuthContext();
    const [loading, setLoading] = useState(false);
    const onHandleInputChange=(fieldName, fieldValue)=>{
        setFormData(prev=>({
            ...prev,
            [fieldName]:fieldValue
        }))
        console.log(formData);
    }
    
  const GenerateVideo=async() => {
    
    if(user?.credits <= 0){
        toast('Please add more credits!')
        return;
    }

    if(!formData?.topic||!formData?.script||!formData.videoStyle||!formData?.caption||!formData?.voice){
        console.log("ERROR", "Enter ALL Field");
        return;
    }
    setLoading(true)
    //Save Video Data First
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
    console.log("--",resp);

    const result = await axios.post('/api/generate-video-data',{
        ...formData,
        recordId: resp,
        
    });

    console.log(result);
    setLoading(false);
  }
  return (
    <AnimeWrapper animation="fadeIn" duration={800}>
        <h2 className='text-3xl font-bold text-white mb-8 drop-shadow-md'>Create New Video</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <AnimeWrapper animation="slideUp" duration={1000} delay={200} className='col-span-2 p-7 border border-white/20 rounded-xl h-[72vh] overflow-auto backdrop-blur-xl bg-black/10 shadow-2xl scrollbar-hide'>
                {/* Topic & Script */}
                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                    <Topic onHandleInputChange={onHandleInputChange}/>
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

export default CreateNewVideo