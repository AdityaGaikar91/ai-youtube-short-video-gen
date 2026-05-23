"use client"
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import axios from "axios";
import { useAuthContext } from "@/app/provider";
const suggestion=[
    "Historic Story",
    "Kids Story",
    "Movie Stories",
    "AI Innovations",
    "Space Mysteries",
    "Horror Stories",
    "Mythological Tales",
    "Tech Breakthroughs",
    "True Crime Stories",
    "Fantasy Adventures",
    "Science Experiments",
    "Motivational Stories",
]
function Topic({onHandleInputChange, initialValue}) {
    const [selectedTopic, setSelectedTopic] = useState(initialValue);
    const [selectedScriptIndex, setSelectedScriptIndex] = useState();
    const [scripts, setScripts] = useState();
    const [loading, setLoading] = useState(false);
    const [isSeries, setIsSeries] = useState(false);
    const {user} = useAuthContext();


    const GenerateScript = async () => {

      if(user?.credits <= 0){
        toast('Please add more credits!')
        return;
      }     
        setLoading(true);
        setSelectedScriptIndex(null);
        try{
        const endpoint = isSeries ? '/api/generate-anime-series' : '/api/generate-script';
        const result = await axios.post(endpoint,{
            topic: selectedTopic
        });
        if (isSeries) {
            setScripts(result.data?.parts);
            onHandleInputChange('isSeries', true);
            onHandleInputChange('seriesTitle', result.data?.seriesTitle);
            onHandleInputChange('scripts', result.data?.parts); // Pass all parts to parent
        } else {
            setScripts(result.data?.scripts);
        }
    }
    catch(e){
    }
    setLoading(false);
    }
  return (
    <div>
      <h2 className="mb-1">Project Title</h2>
      <Input placeholder="Enter project title" onChange = {(event)=>onHandleInputChange('title',event?.target.value)}/>
      <div className="mt-5">
        <h2>Video Topic</h2>
        <p className="text-sm text-gray-600">Select topic for your video</p>

        <Tabs defaultValue={initialValue ? "your_topic" : "suggestion"} className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="your_topic">Your Topic</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div className=''>
                {suggestion.map((suggestion,index)=>(
                    <Button variant="outline" key={index} className={`m-1 ${suggestion==selectedTopic&&'bg-secondary'}`} 
                    onClick={() => {setSelectedTopic(suggestion)
                        onHandleInputChange('topic', suggestion)
                    }}>{suggestion}</Button>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
                <h2>Enter your own topic</h2>
                <Textarea placeholder="Enter your topic"
                value={selectedTopic}
                onChange={(event)=>{
                    setSelectedTopic(event.target.value);
                    onHandleInputChange('topic',event.target.value)
                }}
                />
            </div>
          </TabsContent>
        </Tabs>

        {/* Series Mode Toggle */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <input 
                type="checkbox" 
                id="seriesMode" 
                className="w-4 h-4 accent-purple-600"
                checked={isSeries}
                onChange={(e) => setIsSeries(e.target.checked)}
            />
            <label htmlFor="seriesMode" className="text-sm font-medium cursor-pointer">
                Generate as Multi-Part Series (4 Videos)
            </label>
        </div>

       {scripts?.length> 0 && 
        <div className='mt-3'>
            <h2>Select the Script</h2>
        <div  className='grid grid-cols-2 gap-5 mt-1'>
            {scripts?.map((item, index)=>(
                <div key={index} 
                    className={`p-3 border rounded-lg cursor-pointer
                ${selectedScriptIndex == index && 'border-white bg-secondary'}
                `}
                onClick={() => {setSelectedScriptIndex(index);
                  onHandleInputChange('script', item?.content);
                  if (isSeries) onHandleInputChange('partNumber', item?.partNumber);
                }}
                >
                    {isSeries && <span className="text-xs font-bold text-purple-400 mb-1 block">PART {item.partNumber}</span>}
                    <h2 className='line-clamp-4 text-sm text-gray-300'>{item.content}</h2>
                </div>
            ))}
        </div>
        </div>
        }

      </div>
     {!scripts && <Button className="mt-3" size="sm"
      disabled={loading}
      onClick={GenerateScript}>
        {loading ? <Loader2Icon className='animate-spin'/>: <SparklesIcon />}Generate Script</Button>}
    </div>
  )
}

export default Topic;
