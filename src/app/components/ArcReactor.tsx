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
  const frameIndexRef = useRef(0);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all frames once
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

    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Animation loop using ref instead of state to avoid re-renders
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = framesRef.current[frameIndexRef.current];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    frameIndexRef.current = (frameIndexRef.current + 1) % TOTAL_FRAMES;
    requestRef.current = requestAnimationFrame(animate);
  }, [isLoaded]);

  useEffect(() => {
    if ((isActive || isActivating) && isLoaded) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Draw first frame as static preview
      const canvas = canvasRef.current;
      if (canvas && isLoaded) {
        const ctx = canvas.getContext("2d");
        const img = framesRef.current[0];
        if (ctx && img && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, isActivating, isLoaded, animate]);

  return (
    <div 
      className="relative group cursor-pointer flex flex-col items-center justify-center" 
      onClick={!isActive && !isActivating ? onInitiate : undefined}
    >
      {/* Decorative HUD rings — behind the reactor */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[min(70vw,70vh)] h-[min(70vw,70vh)] border border-stark-cyan/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          className="absolute w-[min(60vw,60vh)] h-[min(60vw,60vh)] border border-stark-cyan/5 rounded-full border-dashed"
        />
      </div>

      {/* Canvas — sized to fit available space, max 420px */}
      <div className={`
        relative w-[min(50vw,420px)] aspect-square transition-all duration-1000 ease-in-out
        ${isActive ? 'drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]' : ''}
        ${isActivating ? 'brightness-150' : ''}
      `}>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full"
          style={{ mixBlendMode: "screen" }}
        />
        
        {isActivating && (
          <motion.div 
            animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-stark-cyan/20 blur-3xl pointer-events-none"
          />
        )}
      </div>

      {/* Status label */}
      <div className="mt-6 text-center z-20">
        <motion.div 
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-sm font-bold tracking-[0.5em] uppercase transition-all duration-500 ${isActive ? 'text-stark-cyan stark-glow' : 'text-stark-cyan/30'}`}
        >
          {isActivating ? "Neural Wake Sequence..." : isActive ? "JARVIS: ONLINE" : "STARK PROTOCOL: STANDBY"}
        </motion.div>
        
        {!isActive && !isActivating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-stark-cyan/20 tracking-[0.3em] mt-2"
          >
            [ Click Core to Initialize ]
          </motion.div>
        )}
      </div>
    </div>
  );
}
