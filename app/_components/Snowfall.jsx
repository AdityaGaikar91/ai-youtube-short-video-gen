"use client";
import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { usePathname } from "next/navigation";

const Snowfall = () => {
  const pathname = usePathname();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing snowflakes to prevent buildup
    container.innerHTML = "";

    const numberOfSnowflakes = 50;
    
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");
        // Randomly position initially
        snowflake.style.transform = `translateX(${Math.random() * window.innerWidth}px) translateY(-50px)`;
        container.appendChild(snowflake);
    }

    const snowflakes = container.querySelectorAll(".snowflake");

    snowflakes.forEach((el) => {
      // Set initial properties using anime.set
      anime.set(el, {
        translateX: () => anime.random(0, window.innerWidth),
        translateY: -50, 
        scale: () => anime.random(0.5, 1.5),
        opacity: () => anime.random(0.4, 0.9),
      });

      // Animate falling
      anime({
        targets: el,
        translateY: () => window.innerHeight + 50,
        translateX: () => anime.random(-100, 100) + parseFloat(el.style.transform.split('translateX(')[1] || 0),
        easing: "linear",
        duration: () => anime.random(3000, 8000),
        delay: () => anime.random(0, 5000),
        loop: true,
      });
    });

    // Cleanup function to remove snowflakes on unmount
    return () => {
        if(container) container.innerHTML = "";
    }

  }, [pathname]);

  return (
    <div 
        ref={containerRef}
        className="snowfall-container fixed inset-0 pointer-events-none z-[-1]" 
        style={{ overflow: "hidden" }}
    >
      <style jsx global>{`
        .snowflake {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          filter: blur(1px);
        }
      `}</style>
    </div>
  );
};

export default Snowfall;
