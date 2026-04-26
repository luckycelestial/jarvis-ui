"use client";

import React from "react";
import { motion } from "framer-motion";

interface SystemLogProps {
  bodyActive: boolean;
  isActivating: boolean;
}

export function SystemLog({ bodyActive, isActivating }: SystemLogProps) {
  const logs = [
    { time: "11:00:29", msg: "Establishing secure link to Head node...", status: "OK" },
    { time: "11:02:12", msg: "Syncing credentials with Body instance", status: "OK" },
    { time: "11:03:45", msg: "Initializing Stark Core Protocol v4.2", status: "OK" },
  ];

  if (isActivating) {
    logs.push({ time: new Date().toLocaleTimeString(), msg: "Waking local hardware (Neural Wake)...", status: "PENDING" });
  } else if (bodyActive) {
    logs.push({ time: "11:12:06", msg: "Body link established via secure tunnel", status: "STABLE" });
    logs.push({ time: new Date().toLocaleTimeString(), msg: "HUD fully synchronized with core brain", status: "ONLINE" });
  }

  return (
    <div className="w-full stark-border bg-background/60 rounded-lg p-4 backdrop-blur-md overflow-hidden flex flex-col" style={{ maxHeight: "200px" }}>
      <div className="text-[10px] text-stark-cyan/60 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
        Command Terminal
      </div>
      
      <div className="flex-1 font-mono text-[8px] space-y-1.5 overflow-y-auto">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-2"
          >
            <span className="text-white/20 shrink-0">[{log.time}]</span>
            <span className="text-stark-cyan/80 flex-1 truncate">{log.msg}</span>
            <span className={`font-bold shrink-0 ${log.status === "OK" || log.status === "ONLINE" || log.status === "STABLE" ? "text-stark-cyan" : "text-stark-red"}`}>
              {log.status}
            </span>
          </motion.div>
        ))}
        <div className="animate-pulse text-stark-cyan/40">_</div>
      </div>
    </div>
  );
}
