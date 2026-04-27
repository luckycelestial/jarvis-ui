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
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function SystemStats({ bodyActive }: { bodyActive: boolean }) {
  const cpu = bodyActive ? Math.floor(Math.random() * 20) + 15 : 0;
  const mem = bodyActive ? Math.floor(Math.random() * 10) + 40 : 0;
  const gpu = bodyActive ? Math.floor(Math.random() * 30) + 5 : 0;
  const disk = bodyActive ? Math.floor(Math.random() * 15) + 25 : 0;
  const net = bodyActive ? Math.floor(Math.random() * 40) + 10 : 0;

  return (
    <div className="w-full stark-border bg-black/60 rounded-lg p-5 backdrop-blur-md">
      <div className="text-[10px] text-stark-cyan/60 uppercase tracking-widest mb-4 flex justify-between">
        <span>Stark Bio-Hardware</span>
        <span className={bodyActive ? "text-stark-cyan" : "text-stark-red font-bold"}>
          {bodyActive ? "Active" : "Offline"}
        </span>
      </div>

      <StatBar label="Neural Processor (CPU)" value={cpu} color="bg-stark-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
      <StatBar label="Core Memory (RAM)" value={mem} color="bg-stark-indigo shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
      <StatBar label="Graphic Engine (GPU)" value={gpu} color="bg-stark-cyan/60" />
      <StatBar label="Storage Matrix (Disk)" value={disk} color="bg-emerald-500/60" />
      <StatBar label="Network I/O" value={net} color="bg-amber-500/60" />

      {/* Detailed Stats */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
        <div className="flex justify-between text-[8px] text-white/25 uppercase tracking-wider">
          <span>Uptime</span>
          <span className="text-stark-cyan/40">{bodyActive ? "04:42:11" : "00:00:00"}</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/25 uppercase tracking-wider">
          <span>Neural Throughput</span>
          <span className="text-stark-cyan/40">{bodyActive ? "1.2 GB/s" : "0 B/s"}</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/25 uppercase tracking-wider">
          <span>Token Rate</span>
          <span className="text-stark-cyan/40">{bodyActive ? "~45 tok/s" : "---"}</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/25 uppercase tracking-wider">
          <span>Active Model</span>
          <span className="text-stark-cyan/40">{bodyActive ? "Gemini 2.5 Flash" : "---"}</span>
        </div>
        <div className="flex justify-between text-[8px] text-white/25 uppercase tracking-wider">
          <span>Context Window</span>
          <span className="text-stark-cyan/40">{bodyActive ? "1M tokens" : "---"}</span>
        </div>
      </div>
    </div>
  );
}
