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
const FRAME_W = 800;
const FRAME_H = 1422;

export function ArcReactor({ isActive, isActivating, onInitiate }: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIndexRef = useRef(0);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const frames: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `${FRAME_PATH}${String(i).padStart(4, "0")}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setIsLoaded(true);
      };
      frames.push(img);
    }
    framesRef.current = frames;
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

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
      className="relative cursor-pointer flex flex-col items-center justify-center h-full" 
      onClick={!isActive && !isActivating ? onInitiate : undefined}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120%] aspect-square border border-stark-cyan/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          className="absolute w-[105%] aspect-square border border-stark-cyan/5 rounded-full border-dashed"
        />
      </div>

      {/* Canvas — full height, 9:16 portrait, black removed via blend */}
      <div 
        className="relative h-full flex items-center justify-center"
        style={{ mixBlendMode: "screen" }}
      >
        <canvas
          ref={canvasRef}
          width={FRAME_W}
          height={FRAME_H}
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Status text — positioned at bottom center */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <motion.div 
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-sm font-bold tracking-[0.5em] uppercase ${isActive ? 'text-stark-cyan stark-glow' : 'text-stark-cyan/30'}`}
        >
          {isActivating ? "Neural Wake Sequence..." : isActive ? "JARVIS: ONLINE" : "STARK PROTOCOL: STANDBY"}
        </motion.div>
        {!isActive && !isActivating && (
          <div className="text-[11px] text-stark-cyan/20 tracking-[0.3em] mt-2">
            [ Click Core to Initialize ]
          </div>
        )}
      </div>
    </div>
  );
}
