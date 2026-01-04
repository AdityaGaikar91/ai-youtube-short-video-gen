"use client";
import React from 'react';
import Snowfall from './Snowfall';
import ShaderBackground from './ShaderBackground';

const Background3D = () => {
    return (
      <div className="absolute inset-0 z-0 select-none" onDragStart={(e) => e.preventDefault()}>
        <ShaderBackground />
        <Snowfall />
      </div>
    );
};

export default Background3D;
