"use client";

import React, { useState, useEffect } from "react";
import { getJarvisStatus, startBody } from "./actions";
import { ArcReactor } from "./components/ArcReactor";

interface SystemStatus {
  body_status: string;
  head_status: string;
  systems_nominal: boolean;
}

export default function JarvisHUD() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isActivating, setIsActivating] = useState(false);

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
    const interval = setInterval(fetchStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStartBody = async () => {
    setIsActivating(true);
    try {
      const success = await startBody();
      if (success) {
        // Poll for a bit to see it turn on
        let attempts = 0;
        const poll = setInterval(async () => {
          await fetchStatus();
          attempts++;
          if (attempts > 6 || status?.body_status === "RUNNING") {
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
    <main className="min-h-screen bg-background text-foreground relative flex items-center justify-center overflow-hidden">
      {/* Subtle Scanline Effect */}
      <div className="scanline" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Primary Interaction: The Arc Reactor */}
      <div className="relative z-10 scale-125 md:scale-150">
        <ArcReactor 
          isActive={status?.body_status === "RUNNING"}
          isActivating={isActivating}
          onInitiate={handleStartBody}
        />
      </div>

      {/* Minimalist Tech Corner Decor */}
      <div className="fixed top-0 left-0 w-16 h-16 border-t border-l border-stark-cyan/5 m-4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-16 h-16 border-b border-r border-stark-cyan/5 m-4 pointer-events-none" />
      
      {/* Meta info */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 opacity-10 text-[8px] uppercase tracking-[1em] text-stark-cyan pointer-events-none">
        Stark Core Protocol // JARVIS-HUD
      </div>
    </main>
  );
}