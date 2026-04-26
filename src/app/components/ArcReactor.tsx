"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ArcReactorProps {
  isActive: boolean;
  isActivating: boolean;
  onInitiate: () => void;
}

export function ArcReactor({ isActive, isActivating, onInitiate }: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const frameCount = 192; // Match the 8s 24fps video

  // Build frame path
  const getFramePath = (index: number) => {
    const padded = String(index + 1).padStart(4, "0");
    return `/frames/arc-reactor/frame-${padded}.webp`;
  };

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / frameCount) * 100));
        if (loadedCount === frameCount) {
          setLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // Draw current frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[currentFrameRef.current];

    if (canvas && ctx && img && img.complete) {
      // Scale canvas to match image aspect ratio/quality if needed
      if (canvas.width !== img.naturalWidth) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Animation Loop logic
  useEffect(() => {
    const animate = () => {
      let targetFrame = currentFrameRef.current;

      if (isActive) {
        // If active, stay on last frame
        targetFrame = frameCount - 1;
      } else if (isActivating) {
        // If activating, move towards the end
        if (currentFrameRef.current < frameCount - 1) {
          targetFrame = currentFrameRef.current + 1;
        }
      } else {
        // If offline, stay on first frame
        targetFrame = 0;
      }

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        draw();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    if (loaded) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, isActivating, loaded, draw]);

  return (
    <div className="relative group cursor-pointer" onClick={!isActive && !isActivating ? onInitiate : undefined}>
      {/* Outer rings */}
      <motion.div 
        animate={{ rotate: 360, scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute -inset-12 border border-dashed ${isActive ? 'border-stark-cyan/40' : 'border-stark-cyan/20'} rounded-full`}
      />
      <motion.div 
        animate={{ rotate: -360, scale: isActive ? 1.2 : 1 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className={`absolute -inset-16 border ${isActive ? 'border-stark-cyan/20' : 'border-stark-cyan/10'} rounded-full`}
      />

      {/* Main Reactor Canvas */}
      <div className={`
        relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden
        border-2 transition-all duration-700
        ${isActive ? 'border-stark-cyan shadow-[0_0_50px_rgba(34,211,238,0.4)]' : 'border-stark-cyan/20'}
        ${isActivating ? 'animate-pulse' : ''}
      `}>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-stark-cyan text-[10px] uppercase tracking-widest">
            <span>Loading Cores...</span>
            <span className="mt-2 text-[8px] opacity-60">{loadProgress}%</span>
          </div>
        )}
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        
        {/* Glow Overlay when active */}
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-stark-cyan/5 rounded-full pointer-events-none"
          />
        )}
      </div>

      {/* Label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-500 ${isActive ? 'text-stark-cyan stark-glow' : 'text-stark-cyan/40'}`}>
          {isActivating ? "Neural Wake Init..." : isActive ? "Jarvis Online" : "System Standby"}
        </span>
      </div>
    </div>
  );
}
