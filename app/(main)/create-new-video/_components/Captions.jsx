import React, { useState } from 'react'
const options = [
    {
        name: 'Youtuber',
        style: 'text-yellow-400 text-3xl font-extrabold uppercase tracking-wide drop-shadow-md px-3 py-1 rounded-lg'
    },
    {
        name: 'Supreme',
        style: 'text-white text-3xl font-bold italic drop-shadow-lg px-3 py-1 rounded-lg'
    },
    {
        name: 'Neon',
        style: 'text-green-500 text-3xl font-extrabold uppercase tracking-wide drop-shadow-lg px-3 py-1 rounded-lg'
    },
    {
        name: 'Glitch',
        style: 'glitch-text text-pink-500 text-3xl font-extrabold uppercase tracking-wide drop-shadow-[4px_4px_0_#ff0000,-2px_-2px_0_#00ff00] px-3 py-1'
    },
    {
        name: 'Fire',
        style: 'text-red-500 text-3xl font-extrabold uppercase px-3 py-1 rounded-lg'
    },
    {
        name: 'Futuristic',
        style: 'futuristic-text bg-gradient-to-r from-purple-600 to-blue-500 text-white font-extrabold uppercase px-3 py-1 rounded-lg'
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