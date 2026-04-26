"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ArcReactorProps {
  isActive: boolean;
  isActivating: boolean;
  onInitiate: () => void;
}

const TOTAL_FRAMES = 192;
const FRAME_PATH = "/frames/arc-reactor/frame-";

export function ArcReactor({ isActive, isActivating, onInitiate }: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload frames for butter-smooth animation
  useEffect(() => {
    let loadedCount = 0;
    const frames: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `${FRAME_PATH}${String(i).padStart(4, "0")}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };
      frames.push(img);
    }
    framesRef.current = frames;

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = framesRef.current[currentFrame - 1];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // Determine playback speed based on state
    let nextFrame = currentFrame + 1;
    if (nextFrame > TOTAL_FRAMES) nextFrame = 1;
    
    // Smooth loop logic
    setCurrentFrame(nextFrame);
    requestRef.current = requestAnimationFrame(renderFrame);
  }, [currentFrame, isLoaded]);

  useEffect(() => {
    if (isActive || isActivating) {
      requestRef.current = requestAnimationFrame(renderFrame);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Reset to idle frame
      setCurrentFrame(1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = framesRef.current[0];
        if (ctx && img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, isActivating, renderFrame]);

  return (
    <div 
      className="relative group cursor-pointer flex flex-col items-center justify-center" 
      onClick={!isActive && !isActivating ? onInitiate : undefined}
    >
      {/* HUD Rings - Dynamic Aura */}
      <motion.div 
        animate={{ rotate: 360, scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[80vh] h-[80vh] border border-stark-cyan/10 rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ rotate: -360, scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[75vh] h-[75vh] border border-stark-cyan/5 rounded-full pointer-events-none border-dashed"
      />

      {/* Main Reactor Canvas - Frame-Based for Performance */}
      <div className={`
        relative w-[40vh] h-[40vh] transition-all duration-1000 ease-in-out
        ${isActive ? 'opacity-100 scale-110 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]' : 'opacity-60 scale-100'}
        ${isActivating ? 'brightness-150' : ''}
      `}>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full object-contain"
        />
        
        {/* Core Status Pulse Overlays */}
        {isActivating && (
          <motion.div 
            animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-stark-cyan/20 blur-xl pointer-events-none mix-blend-screen"
          />
        )}
      </div>

      {/* System Status Label */}
      <div className="mt-12 text-center">
        <motion.div 
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-[14px] font-bold tracking-[0.5em] uppercase transition-all duration-500 ${isActive ? 'text-stark-cyan stark-glow' : 'text-stark-cyan/30'}`}
        >
          {isActivating ? "Neural Wake Sequence..." : isActive ? "JARVIS: ONLINE" : "STARK PROTOCOL: STANDBY"}
        </motion.div>
        
        {!isActive && !isActivating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-stark-cyan/20 tracking-[0.3em] mt-2"
          >
            [ Click Core to Initialize ]
          </motion.div>
        )}
      </div>
    </div>
  );
}
