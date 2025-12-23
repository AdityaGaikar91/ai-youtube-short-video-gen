import React, { useState } from 'react'
const options = [
    {
        name: 'Minimal',
        style: 'text-white text-2xl font-semibold tracking-wide drop-shadow-sm'
    },
    {
        name: 'Super',
        style: 'text-white text-4xl font-black uppercase text-stroke-2 text-stroke-black drop-shadow-[4px_4px_0_#000]'
    },
    {
        name: 'Neon',
        style: 'text-cyan-400 text-3xl font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,1)]'
    },
    {
        name: 'Playful',
        style: 'text-white text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-full shadow-xl transform -rotate-2'
    },
    {
        name: 'Cinematic',
        style: 'text-amber-100/90 text-2xl font-serif tracking-[0.2em] uppercase drop-shadow-lg'
    },
    {
        name: 'Bold',
        style: 'text-yellow-400 text-3xl font-black uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
    },
    {
        name: 'Comic',
        style: 'text-black text-3xl font-extrabold uppercase bg-white px-2 py-1 border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
    }
]

function Captions({onHandleInputChange}) {
    const [selectedCaptionStyle, setSelectedCaptionStyle] = useState();
  return (
    <div className='mt-5'>
        <h2>Caption Style</h2>
        <p className='text-sm text-gray-400'>Select Caption Style</p>

        <div className='flex flex-wrap gap-4 mt-2'>
            {options.map((option, index) => (
                <div key={index} 
                onClick={() => {
                    setSelectedCaptionStyle(option.name)
                    onHandleInputChange('caption',option)
                }}
                className={`p-2 hover:border bg-slate-900 
                border-gray-300 cursor-pointer rounded-lg
                ${selectedCaptionStyle == option.name && 'border'}`}>
                    <h2 className={option.style}>{option.name}</h2>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Captions