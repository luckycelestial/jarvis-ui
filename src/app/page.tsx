"use client";

import React, { useState, useEffect } from "react";
import { getJarvisStatus, startBody } from "./actions";
import { ArcReactor } from "./components/ArcReactor";
import { NodeMap } from "./components/NodeMap";
import { SystemStats } from "./components/SystemStats";
import { SystemLog } from "./components/SystemLog";
import { motion, AnimatePresence } from "framer-motion";

interface SystemStatus {
  body_status: string;
  head_status: string;
  systems_nominal: boolean;
}

export default function JarvisHUD() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const bodyActive = status?.body_status === "RUNNING";

  const fetchStatus = async () => {
    try {
      const data = await getJarvisStatus();
      if (data) {
        setStatus(data);
      } else {
        setStatus(null);
      }
    } catch (err) {
      setStatus(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBody = async () => {
    setIsActivating(true);
    try {
      const success = await startBody();
      if (success) {
        let attempts = 0;
        const poll = setInterval(async () => {
          await fetchStatus();
          attempts++;
          if (attempts > 10 || status?.body_status === "RUNNING") {
            clearInterval(poll);
            setIsActivating(false);
          }
        }, 3000);
      } else {
        setIsActivating(false);
      }
    } catch (err) {
      setIsActivating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-mono">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,transparent_70%)]" />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* TOP LEFT: Global Node Matrix */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-8 left-8 z-20"
      >
        <NodeMap headActive={true} bodyActive={bodyActive} />
      </motion.div>

      {/* TOP RIGHT: Hardware Monitor */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-8 right-8 z-20"
      >
        <SystemStats bodyActive={bodyActive} />
      </motion.div>

      {/* BOTTOM LEFT: Command Terminal */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 left-8 z-20"
      >
        <SystemLog bodyActive={bodyActive} isActivating={isActivating} />
      </motion.div>

      {/* BOTTOM RIGHT: Protocol Signature */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="fixed bottom-8 right-8 z-20 text-[10px] text-stark-cyan text-right tracking-[0.5em] leading-relaxed uppercase"
      >
        STARK INDUSTRIES // HUD v4.2<br />
        NEURAL LINK: {bodyActive ? "STABLE" : "STANDBY"}<br />
        ENCRYPTION: AES-256
      </motion.div>

      {/* CENTER: The Arc Reactor (Primary Core) */}
      <div className="flex items-center justify-center min-h-screen relative z-10 scale-90 md:scale-100">
        <ArcReactor 
          isActive={bodyActive}
          isActivating={isActivating}
          onInitiate={handleStartBody}
        />
      </div>

      {/* CENTER OVERLAY: HUD Compass Decor */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="w-[90vh] h-[90vh] border border-stark-cyan/30 rounded-full flex items-center justify-center"
        >
          <div className="w-[85vh] h-[85vh] border-t-2 border-stark-cyan/50 rounded-full" />
        </motion.div>
      </div>

      {/* FOOTER LABEL */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 opacity-20 text-[8px] uppercase tracking-[1.5em] text-stark-cyan pointer-events-none">
        Neural Wake Sequence Active // JARVIS OS
      </div>
    </main>
  );
}