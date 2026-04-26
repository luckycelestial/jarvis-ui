"use client";

import React, { useState, useEffect } from "react";
import { getJarvisStatus, startBody } from "./actions";
import { ArcReactor } from "./components/ArcReactor";
import { NodeMap } from "./components/NodeMap";
import { SystemStats } from "./components/SystemStats";
import { SystemLog } from "./components/SystemLog";
import { ChatInterface } from "./components/ChatInterface";
import { CoreDashboard } from "./components/CoreDashboard";
import { motion, AnimatePresence } from "framer-motion";

interface SystemStatus {
  body_status: string;
  head_status: string;
  systems_nominal: boolean;
}

type Tab = "HUD" | "CHAT" | "CORE";

export default function JarvisHUD() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("HUD");

  const bodyActive = status?.body_status === "RUNNING";

  const fetchStatus = async () => {
    try {
      const data = await getJarvisStatus();
      if (data) setStatus(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
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
          if (attempts > 20 || status?.body_status === "RUNNING") {
            clearInterval(poll);
            setIsActivating(false);
          }
        }, 2000);
      } else {
        setIsActivating(false);
      }
    } catch {
      setIsActivating(false);
    }
  };

  return (
    <main className="h-screen bg-background text-foreground relative overflow-hidden font-mono flex flex-col">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.04)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/60 shrink-0">
        <div className="flex items-center gap-6">
          <div className="text-stark-cyan text-lg font-black tracking-tighter">STARK INDUSTRIES</div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex gap-8">
            {(["HUD", "CHAT", "CORE"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] tracking-[0.4em] transition-all ${activeTab === tab ? 'text-stark-cyan stark-glow' : 'text-white/20 hover:text-white/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-stark-cyan/60">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bodyActive ? 'bg-stark-cyan animate-pulse shadow-[0_0_10px_#22d3ee]' : 'bg-stark-red'}`} />
            BODY_NODE_{bodyActive ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="h-2 w-px bg-white/10" />
          <div>{new Date().toLocaleTimeString()}</div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ========== HUD TAB ========== */}
          {activeTab === "HUD" && (
            <motion.div 
              key="hud"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Arc Reactor — full viewport height, goes behind navbar */}
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ top: "-48px" }}>
                <ArcReactor 
                  isActive={bodyActive}
                  isActivating={isActivating}
                  onInitiate={handleStartBody}
                />
              </div>

              {/* LEFT PANELS — wider, floating over reactor */}
              <div className="absolute top-4 left-4 w-[340px] flex flex-col gap-4 z-20">
                <NodeMap headActive={true} bodyActive={bodyActive} />
                <SystemLog bodyActive={bodyActive} isActivating={isActivating} />
              </div>

              {/* RIGHT PANEL — wider */}
              <div className="absolute top-4 right-4 w-[340px] z-20">
                <SystemStats bodyActive={bodyActive} />
              </div>
            </motion.div>
          )}

          {/* ========== CHAT TAB ========== */}
          {activeTab === "CHAT" && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <ChatInterface />
            </motion.div>
          )}

          {/* ========== CORE TAB ========== */}
          {activeTab === "CORE" && (
            <motion.div 
              key="core"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <CoreDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="relative z-40 px-6 py-3 flex justify-between items-center border-t border-white/5 bg-black/60 backdrop-blur-md opacity-60 shrink-0">
        <div className="text-[8px] uppercase tracking-[0.5em]">
          Neural Link: v4.2 {"//"}  Sub-Node Asia-South-1a
        </div>
        <div className="text-[8px] uppercase tracking-[0.5em] text-right">
          Jarvis OS {"//"}  {status?.systems_nominal ? "Nominal" : "Stabilizing"} {"//"}  RSA-4096
        </div>
      </footer>
    </main>
  );
}