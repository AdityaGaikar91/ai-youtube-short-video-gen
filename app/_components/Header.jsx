"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import Authentication from "./Authentication";
import { useAuthContext } from "../provider";
import Link from "next/link";
import AnimeWrapper from "./AnimeWrapper";
import { Menu, X } from "lucide-react";

function Header() {
  const {user} = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <AnimeWrapper animation="fadeIn" duration={1000} className='p-4 flex flex-col md:flex-row items-center justify-between pointer-events-none sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-sm transition-all duration-300'>
      
      <div className="flex items-center justify-between w-full md:w-auto pointer-events-auto">
        <Link href={'https://ai-youtube-short-video-gen-jgaj.vercel.app/'}>
            <div className='flex items-center gap-3 cursor-pointer'>
                <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
                <h2 className='text-2xl font-bold'>GenVid</h2>
            </div>
        </Link>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white hover:bg-white/10">
                {isMenuOpen ? <X /> : <Menu />}
            </Button>
        </div>
      </div>
      

      {/* Desktop Navigation */}
      <div className='hidden md:flex items-center gap-3 pointer-events-auto'>
       {!user? <Authentication>
           <AnimeWrapper hover>
            <Button>Get Started</Button>
           </AnimeWrapper>
        </Authentication>
        :<div className='flex items-center gap-3'>
          <AnimeWrapper hover>
            <Link href={'/dashboard'}>
                <Button>Dashboard</Button>
            </Link>
          </AnimeWrapper>
          {user?.pictureURL&&<Image src={user?.pictureURL} alt='userImage' width={40} height={40}
          className='rounded-full'
          />}
        </div>}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden w-full pt-4 pb-2 border-t border-white/10 mt-2 flex flex-col gap-3 pointer-events-auto animate-in slide-in-from-top-2">
             {!user? 
             <div className="flex justify-center flex-col gap-3">
                <Authentication>
                    <Button className="w-full">Get Started</Button>
                </Authentication>
             </div>
            :<div className='flex flex-col gap-4 items-center'>
               <div className="flex items-center gap-2">
                    {user?.pictureURL&&<Image src={user?.pictureURL} alt='userImage' width={30} height={30}
                    className='rounded-full'
                    />}
                    <span className="text-sm font-medium">{user?.name || user?.email}</span>
               </div>
              <Link href={'/dashboard'} className="w-full">
                   <Button className="w-full" variant="secondary">Dashboard</Button>
              </Link>
            </div>}
        </div>
      )}

    </AnimeWrapper>
  )
}

export default Header;
