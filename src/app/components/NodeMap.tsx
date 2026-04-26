"use client";

import React from "react";
import { motion } from "framer-motion";

interface NodeMapProps {
  headActive: boolean;
  bodyActive: boolean;
}

export function NodeMap({ headActive, bodyActive }: NodeMapProps) {
  return (
    <div className="w-full stark-border bg-black/60 rounded-lg p-5 backdrop-blur-md">
      <div className="text-[10px] text-stark-cyan/60 uppercase tracking-widest mb-4 flex justify-between">
        <span>Global Node Matrix</span>
        <span className="animate-pulse text-stark-cyan/40">Live</span>
      </div>
      
      {/* Map */}
      <div className="relative w-full h-32 bg-stark-cyan/5 rounded flex items-center justify-center mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full opacity-20">
          <path d="M20,50 Q60,20 100,50 T180,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M30,30 L170,70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* Head Node */}
        <div className="absolute left-[25%] top-[35%]">
          <motion.div 
            animate={headActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${headActive ? 'bg-stark-cyan shadow-[0_0_12px_#22d3ee]' : 'bg-white/10'}`}
          />
          <span className="absolute top-4 -left-2 text-[8px] text-stark-cyan/50 whitespace-nowrap font-bold">JARVIS-HEAD</span>
          <span className="absolute top-7 -left-2 text-[7px] text-white/20 whitespace-nowrap">Local • 1GB RAM</span>
        </div>

        {/* Body Node */}
        <div className="absolute right-[20%] bottom-[25%]">
          <motion.div 
            animate={bodyActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`w-3 h-3 rounded-full ${bodyActive ? 'bg-stark-cyan shadow-[0_0_12px_#22d3ee]' : 'bg-white/10'}`}
          />
          <span className="absolute top-4 -right-2 text-[8px] text-stark-cyan/50 whitespace-nowrap text-right font-bold">JARVIS-BODY</span>
          <span className="absolute top-7 -right-2 text-[7px] text-white/20 whitespace-nowrap text-right">GCP • asia-south1</span>
        </div>

        {/* Sync Line */}
        {headActive && bodyActive && (
          <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path 
              d="M55,40 L155,70" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        )}
      </div>

      {/* Node Status Grid */}
      <div className="grid grid-cols-3 gap-2 text-[8px] text-white/30 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${headActive ? 'bg-stark-cyan' : 'bg-stark-red'}`} />
          <span>Head</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${bodyActive ? 'bg-stark-cyan' : 'bg-stark-red'}`} />
          <span>Body</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${headActive && bodyActive ? 'bg-stark-cyan' : 'bg-white/10'}`} />
          <span>Tunnel</span>
        </div>
      </div>

      {/* Network Stats */}
      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
        <div className="flex justify-between text-[8px] text-white/20">
          <span>Latency</span>
          <span className="text-stark-cyan/50">{bodyActive ? "42ms" : "---"}</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/20">
          <span>Tunnel Protocol</span>
          <span className="text-stark-cyan/50">Cloudflare Quick</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/20">
          <span>Encryption</span>
          <span className="text-stark-cyan/50">TLS 1.3 / AES-256</span>
        </div>
      </div>
    </div>
  );
}
