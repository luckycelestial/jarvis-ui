"use client";

import React from "react";
import { motion } from "framer-motion";

interface NodeMapProps {
  headActive: boolean;
  bodyActive: boolean;
}

export function NodeMap({ headActive, bodyActive }: NodeMapProps) {
  return (
    <div className="relative w-64 h-40 stark-border bg-background/50 rounded-lg p-4 backdrop-blur-md overflow-hidden">
      <div className="text-[10px] text-stark-cyan/60 uppercase tracking-widest mb-4 flex justify-between">
        <span>Global Node Matrix</span>
        <span className="animate-pulse">Live</span>
      </div>
      
      {/* Schematic Map Base */}
      <div className="relative w-full h-24 bg-stark-cyan/5 rounded flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full h-full opacity-20">
          <path d="M20,50 Q60,20 100,50 T180,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M30,30 L170,70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* Head Node (US Central) */}
        <div className="absolute left-[30%] top-[40%]">
          <motion.div 
            animate={headActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${headActive ? 'bg-stark-cyan' : 'bg-white/10'}`}
          />
          <span className="absolute top-4 -left-2 text-[8px] text-stark-cyan/40 whitespace-nowrap">JARVIS-HEAD (US)</span>
        </div>

        {/* Body Node (India South) */}
        <div className="absolute right-[20%] bottom-[30%]">
          <motion.div 
            animate={bodyActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`w-3 h-3 rounded-full ${bodyActive ? 'bg-stark-cyan' : 'bg-white/10'}`}
          />
          <span className="absolute top-4 -right-2 text-[8px] text-stark-cyan/40 whitespace-nowrap text-right">JARVIS-BODY (IN)</span>
        </div>

        {/* Sync Line */}
        {headActive && bodyActive && (
          <motion.div 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <motion.path 
                d="M65,45 L155,65" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="1" 
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </motion.div>
        )}
      </div>

      <div className="mt-2 flex justify-between items-center text-[8px] text-stark-cyan/40">
        <div className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${headActive ? 'bg-stark-cyan' : 'bg-red-500'}`} />
          HEAD_UP
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${bodyActive ? 'bg-stark-cyan' : 'bg-red-500'}`} />
          BODY_UP
        </div>
        <div className="tracking-tighter">SECURE_TUNNEL_v4.2</div>
      </div>
    </div>
  );
}
