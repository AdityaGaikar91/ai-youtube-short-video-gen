"use client"
import { SidebarProvider } from '@/components/ui/sidebar'
import React, { useEffect, useRef } from 'react'
import AppSidebar from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'
import { useAuthContext } from '../provider';
import { usePathname, useRouter } from 'next/navigation';
import anime from 'animejs/lib/anime.es.js';
import ShaderBackground from '@/app/_components/ShaderBackground';


function DashboardProvider({children}) {

  const {user} = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef(null);

  useEffect(() => {
      user && CheckedUserAuthenticated();
  },[user]);

  const CheckedUserAuthenticated=()=>{
    if(!user)
    {
            router.replace('/');
    }
  }

  // Animate content on route change
  useEffect(() => {
    if (contentRef.current) {
        // Reset state before animating
        anime.set(contentRef.current, {
            opacity: 0,
            translateY: 20
        });

        anime({
            targets: contentRef.current,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutExpo',
            delay: 200 // Slight delay to wait for sidebar or just feel smoother
        });
    }
  }, [pathname]);

  return (
      <SidebarProvider>
         <div className="fixed inset-0 -z-10">
            <ShaderBackground />
         </div>
          <AppSidebar/>
          <div className='w-full relative z-10'>
            <AppHeader/>
             <div ref={contentRef} className='p-10 opacity-0'>
                 {children}
             </div>
          </div>
      </SidebarProvider>
  )
}

export default DashboardProvider