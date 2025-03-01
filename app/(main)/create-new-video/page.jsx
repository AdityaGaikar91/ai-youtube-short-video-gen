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
    <div>
        <h2 className='text-3xl'>Create New Video</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 mt-8 gap-7'>
            <div className='col-span-2 p-7 border rounded-xl h-[72vh] overflow-auto'>
                {/* Topic & Script */}
                <Topic onHandleInputChange={onHandleInputChange}/>

                {/* Video Image Style */}
                <VideoStyle onHandleInputChange={onHandleInputChange}/>

                {/* Voice */}
                <Voice onHandleInputChange={onHandleInputChange}/>

                {/* Captions */}
                <Captions onHandleInputChange={onHandleInputChange}/>
                <Button className="w-full mt-5"
                    disabled={loading}
                    onClick={GenerateVideo}
                >{loading ? <Loader2Icon className='animate-spin' /> : <WandSparkles/>}Generate Video</Button>

                
            </div>
            <div>
                <Preview formData={formData}/>
            </div>
        </div>
       
    </div>
  )
}

export default CreateNewVideo