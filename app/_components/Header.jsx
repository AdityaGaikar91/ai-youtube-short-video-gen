"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import Authentication from "./Authentication";
import { useAuthContext } from "../provider";
import Link from "next/link";

function Header() {
  const {user} = useAuthContext();
  return (
    <div className='p-4 flex items-center justify-between pointer-events-none'>
      <div className='flex items-center gap-3 pointer-events-auto'>
      <Link href={'https://ai-youtube-short-video-gen-jgaj.vercel.app/'}>
        <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
        <h2 className='text-2xl font-bold'>GenVid</h2>
        </Link>
      </div>
      

      <div className='pointer-events-auto'>
       {!user? <Authentication>
           <Button>Get Started</Button>
        </Authentication>
        :<div className='flex items-center gap-3'>
          <Link href={'/dashboard'}>
               <Button>Dashboard</Button>
          </Link>
          {user?.pictureURL&&<Image src={user?.pictureURL} alt='userImage' width={40} height={40}
          className='rounded-full'
          />}
        </div>}
      </div>
    </div>
  )
}

export default Header;
