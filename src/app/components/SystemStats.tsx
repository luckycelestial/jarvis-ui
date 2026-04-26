"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

function StatBar({ label, value, color }: StatBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1 text-stark-cyan/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

export function SystemStats({ bodyActive }: { bodyActive: boolean }) {
  const cpu = bodyActive ? Math.floor(Math.random() * 20) + 15 : 0;
  const mem = bodyActive ? Math.floor(Math.random() * 10) + 40 : 0;
  const gpu = bodyActive ? Math.floor(Math.random() * 30) + 5 : 0;

  return (
    <div className="w-full stark-border bg-background/60 rounded-lg p-4 backdrop-blur-md">
      <div className="text-[10px] text-stark-cyan/60 uppercase tracking-widest mb-4 flex justify-between">
        <span>Stark Bio-Hardware</span>
        <span className={bodyActive ? "text-stark-cyan" : "text-stark-red"}>
          {bodyActive ? "Active" : "Offline"}
        </span>
      </div>

      <StatBar label="Neural Processor (CPU)" value={cpu} color="bg-stark-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
      <StatBar label="Core Memory (RAM)" value={mem} color="bg-stark-indigo shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
      <StatBar label="Graphic Engine (GPU)" value={gpu} color="bg-stark-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />

      <div className="mt-4 pt-2 border-t border-white/5 flex flex-col gap-1">
        <div className="flex justify-between text-[7px] text-white/20 uppercase tracking-tighter">
          <span>Uptime</span>
          <span>{bodyActive ? "04:42:11" : "00:00:00"}</span>
        </div>
        <div className="flex justify-between text-[7px] text-white/20 uppercase tracking-tighter">
          <span>Neural Throughput</span>
          <span>{bodyActive ? "1.2 GB/s" : "0 B/s"}</span>
        </div>
      </div>
    </div>
  );
}
