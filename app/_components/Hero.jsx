import { Button } from '@/components/ui/button'
import React from 'react'
import Authentication from './Authentication'
import Link from 'next/link';
import AnimeWrapper from './AnimeWrapper';

function Hero() {
  return (
    <div className='p-5 px-6 flex flex-col items-center justify-center mt-24 md:px-20 lg:px-36 xl:px-48 pointer-events-none relative z-10'>
        <AnimeWrapper animation="scaleIn" duration={1200}>
            <div className='backdrop-blur-md bg-white/5 border border-white/10 p-5 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center'>
                <h2 className='font-bold text-3xl md:text-6xl text-center text-primary drop-shadow-md'>AI Youtube Short Video Generator</h2>
                <p className='mt-4 text-lg md:text-2xl text-center text-gray-500'>🤖 AI generates scripts, images, and voiceovers in seconds. ⚡Create, edit, and publish engaging shorts with ease!</p>
                <div className='mt-7 gap-4 flex flex-row justify-center items-center w-full md:w-auto pointer-events-auto'>
                    <AnimeWrapper hover>
                        <Link href="/explore">
                            <Button size="lg" variant="secondary" className="w-full md:w-auto">Explore</Button>
                        </Link>
                    </AnimeWrapper>
                    <AnimeWrapper hover>
                        <Authentication>
                            <Button size="lg" className="w-full md:w-auto">Get Started</Button>
                        </Authentication>
                    </AnimeWrapper>
                </div>
            </div>
        </AnimeWrapper>
    </div>
  )
}

export default Hero