"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ArcReactorProps {
  isActive: boolean;
  isActivating: boolean;
  onInitiate: () => void;
}

export function ArcReactor({ isActive, isActivating, onInitiate }: ArcReactorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive || isActivating) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, isActivating]);

  return (
    <div 
      className="relative group cursor-pointer flex flex-col items-center justify-center" 
      onClick={!isActive && !isActivating ? onInitiate : undefined}
    >
      {/* HUD Rings - Subtle Background Decor */}
      <motion.div 
        animate={{ rotate: 360, scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[80vh] h-[80vh] border border-stark-cyan/5 rounded-full pointer-events-none"
      />

      {/* Main Reactor Video Container */}
      <div className={`
        relative w-[35vh] aspect-[9/16] transition-all duration-1000 ease-in-out
        ${isActive ? 'opacity-100 scale-105' : 'opacity-80 scale-100'}
        ${isActivating ? 'brightness-125' : ''}
      `}>
        <video
          ref={videoRef}
          src="/Arc Reactor.mp4"
          loop
          muted
          playsInline
          className="w-full h-full object-contain mix-blend-screen"
          style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(34,211,238,0.3))' : 'none' }}
        />
        
        {/* Core Status Pulse */}
        {isActivating && (
          <motion.div 
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-stark-cyan/10 pointer-events-none mix-blend-overlay"
          />
        )}
      </div>

      {/* System Status Label */}
      <div className="mt-8">
        <motion.div 
          animate={isActive ? { opacity: [0.4, 1, 0.4] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-[12px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 ${isActive ? 'text-stark-cyan stark-glow' : 'text-stark-cyan/30'}`}
        >
          {isActivating ? "Neural Wake Sequence..." : isActive ? "Jarvis: Neural Link Active" : "Stark Protocol: Standby"}
        </motion.div>
      </div>
    </div>
  );
}
  );
}
