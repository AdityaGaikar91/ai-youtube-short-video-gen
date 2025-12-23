"use client"
import React, { useEffect, useRef } from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
  } from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Gem, HomeIcon, LucideFileVideo, Search, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/app/provider'
import anime from 'animejs/lib/anime.es.js'

const MenuItems=[
    {
        title:'Home',
        url:'/dashboard',
        icon: HomeIcon
    },
    {
        title:'Create New Video',
        url:'/create-new-video',
        icon: LucideFileVideo
    },
    {
        title:'Explore',
        url:'/explore',
        icon: Search
    },
    {
        title:'Billing',
        url:'/billing',
        icon: WalletCards
    }
]

function AppSidebar() {
    const path = usePathname();
    const {user} = useAuthContext();
    const logoRef = useRef(null);
    const titleRef = useRef(null);
    const subTitleRef = useRef(null);
    const menuRef = useRef(null);
    const creditsRef = useRef(null);

    const { openMobile, isMobile } = useSidebar();
    
    useEffect(() => {
        // Logo and Title Animation
        if (logoRef.current && titleRef.current) {
            anime.set([logoRef.current, titleRef.current], { opacity: 0, translateX: -50 });
            anime({
                targets: [logoRef.current, titleRef.current],
                translateX: [-50, 0],
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutExpo',
                delay: anime.stagger(100)
            });
        }

        // Subtitle Animation
        if (subTitleRef.current) {
            anime.set(subTitleRef.current, { opacity: 0, translateY: 20 });
            anime({
                targets: subTitleRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: 'easeOutExpo',
                delay: 400
            });
        }

        // Menu Items Stagger Animation
        if (menuRef.current) {
            const items = menuRef.current.querySelectorAll('.sidebar-item-animate');
            if (items.length > 0) {
                anime.set(items, { opacity: 0, translateX: -20 });
                anime({
                    targets: items,
                    translateX: [-20, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100, {start: 600}),
                    duration: 800,
                    easing: 'easeOutExpo'
                });
            }
        }

        // Credits Section Animation
        if (creditsRef.current) {
            anime.set(creditsRef.current, { opacity: 0, translateY: 20 });
            anime({
                targets: creditsRef.current,
                translateY: [20, 0],
                opacity: [0, 1],
                delay: 1000,
                duration: 800,
                easing: 'easeOutExpo'
            });
        }

    }, [openMobile, isMobile]);

    const handleMouseEnter = (e) => {
        anime({
          targets: e.currentTarget,
          scale: 1.05,
          duration: 300,
          easing: 'easeOutQuad'
        });
    };

    const handleMouseLeave = (e) => {
        anime({
          targets: e.currentTarget,
          scale: 1.0,
          duration: 300,
          easing: 'easeOutQuad'
        });
    };

    console.log(path)
  return (
    <Sidebar className="bg-transparent border-r-0"> {/* Transparent background for Glass UI */}
    <SidebarHeader className="bg-black/10 backdrop-blur-md rounded-br-2xl border-b border-r border-white/20">
        <div className='overflow-hidden p-4'> {/* Added overflow hidden to mask slide-in */}
        <Link href={'https://ai-youtube-short-video-gen-jgaj.vercel.app/'}>
        <div className='flex items-center gap-3 w-full justify-center'>
        
            <div ref={logoRef} className="drop-shadow-lg">
                <Image src={'/logo.svg'} alt='logo' width={40} height={40}/>
            </div>
            <h2 ref={titleRef} className='font-bold text-2xl text-white drop-shadow-md'>GenVid</h2>
        
        </div>
        </Link>
        <h2 ref={subTitleRef} className='text-lg text-white/70 text-center mt-3 tracking-wide'>AI Short Video Generator</h2>
        </div>
    </SidebarHeader>
    <SidebarContent className="bg-black/5 backdrop-blur-sm pt-5">
      <SidebarGroup>
        <SidebarGroupContent>
            <SidebarMenu ref={menuRef}>
                {MenuItems.map((menu,index) => (
                    <SidebarMenuItem className="mt-3 mx-3 sidebar-item-animate" key={menu.url}>
                        <SidebarMenuButton 
                            isActive={path==menu.url} 
                            className={`p-5 transition-none text-white hover:bg-white/20 hover:text-white ${path==menu.url ? 'bg-primary/80 backdrop-blur-md shadow-lg border border-white/20' : ''}`} // Glass style for active button
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link href={menu?.url} className='flex items-center gap-4 p-3'>
                               <menu.icon className="w-6 h-6"/>
                               <span className="text-lg font-medium">{menu?.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup/>
    </SidebarContent>
    <SidebarFooter className="bg-black/10 backdrop-blur-md border-t border-r border-white/20">
        <div ref={creditsRef} className='p-5 m-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md shadow-lg'>
            <div className='flex items-center justify-between'>
                <Gem className='text-white/80'/>
                <h2 className='text-white/90 font-semibold'>{user?.credits} Credits Left</h2>
            </div>
            <Link href={'/billing'}>
            <Button className="w-full mt-3 hover:scale-105 transition-transform bg-gradient-to-r from-purple-500 to-pink-500 border-none shadow-lg text-white font-bold">Buy More Credits</Button>
            </Link>
        </div>
    </SidebarFooter>
  </Sidebar>
  )
}

export default AppSidebar