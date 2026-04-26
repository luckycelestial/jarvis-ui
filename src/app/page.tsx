"use client";

import React, { useState, useEffect } from "react";
import { getJarvisStatus, startBody } from "./actions";
import { ArcReactor } from "./components/ArcReactor";
import { NodeMap } from "./components/NodeMap";
import { SystemStats } from "./components/SystemStats";
import { SystemLog } from "./components/SystemLog";
import { ChatInterface } from "./components/ChatInterface";
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

  // Force bodyActive to true for UI indicators if status says RUNNING
  const bodyActive = status?.body_status === "RUNNING";

  const fetchStatus = async () => {
    try {
      const data = await getJarvisStatus();
      if (data) {
        setStatus(data);
        console.log("System Status Updated:", data);
      }
    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll faster (5s)
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
    } catch (err) {
      setIsActivating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-mono flex flex-col">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-30 p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="text-stark-cyan text-xl font-black tracking-tighter">STARK INDUSTRIES</div>
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 p-8">
        <AnimatePresence mode="wait">
          {activeTab === "HUD" && (
            <motion.div 
              key="hud"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full relative"
            >
              {/* TOP LEFT: Node Matrix */}
              <div className="absolute top-0 left-0">
                <NodeMap headActive={true} bodyActive={bodyActive} />
              </div>

              {/* TOP RIGHT: Hardware Monitor */}
              <div className="absolute top-0 right-0">
                <SystemStats bodyActive={bodyActive} />
              </div>

              {/* BOTTOM LEFT: Command Terminal */}
              <div className="absolute bottom-0 left-0">
                <SystemLog bodyActive={bodyActive} isActivating={isActivating} />
              </div>

              {/* CENTER: The Arc Reactor */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <ArcReactor 
                  isActive={bodyActive}
                  isActivating={isActivating}
                  onInitiate={handleStartBody}
                />
              </div>
            </motion.div>
          )}

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

          {activeTab === "CORE" && (
            <motion.div 
              key="core"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-stark-cyan/20 tracking-[1em] uppercase text-xs"
            >
              Accessing Neural Engine Core... [ Restricted ]
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER METRICS */}
      <footer className="relative z-30 p-6 flex justify-between items-end border-t border-white/5 opacity-40">
        <div className="text-[8px] uppercase tracking-[1em]">
          Neural Link: v4.2 // Sub-Node Asia-South-1a
        </div>
        <div className="text-[8px] uppercase tracking-[0.5em] text-right">
          Jarvis OS // {status?.systems_nominal ? "Nominal" : "Stabilizing"}<br />
          Encryption Active: RSA-4096
        </div>
      </footer>
    </main>
  );
}