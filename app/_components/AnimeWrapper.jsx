"use client";
import React, { useEffect, useRef } from "react";
import anime from "animejs";

const AnimeWrapper = ({
  children,
  animation = "fadeIn", // fadeIn, slideUp, scaleIn, or null
  duration = 800,
  delay = 0,
  easing = "easeOutExpo",
  className = "",
  hover = false, // If true, applies hover effect
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    // If no animation is specified, just set opacity to 1 and return
    if (!animation) {
         if (elementRef.current) elementRef.current.style.opacity = 1;
         return;
    }

    const targets = elementRef.current;
    
    let animProps = {
      targets,
      duration,
      delay,
      easing,
      opacity: [0, 1],
    };

    if (animation === "slideUp") {
      animProps = {
        ...animProps,
        translateY: [20, 0],
      };
    } else if (animation === "scaleIn") {
      animProps = {
        ...animProps,
        scale: [0.9, 1],
      };
    }

    anime(animProps);
  }, [animation, duration, delay, easing]);

  const handleMouseEnter = () => {
    if (!hover) return;
    anime({
      targets: elementRef.current,
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  const handleMouseLeave = () => {
    if (!hover) return;
    anime({
      targets: elementRef.current,
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  return (
    <div
      ref={elementRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: animation ? 0 : 1 }} // Start invisible only if there is an entrance animation
    >
      {children}
    </div>
  );
};

export default AnimeWrapper;
