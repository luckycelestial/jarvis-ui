"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  Activity, 
  Power, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Globe, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { getJarvisStatus, startBrain } from "./actions";

// --- Types ---
interface SystemStatus {
  brain_status: string;
  head_status: string;
  systems_nominal: boolean;
}

export default function JarvisHUD() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Digital clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (msg: string, type: "info" | "error" | "action" = "info") => {
    const prefix = type === "error" ? "[ERROR]" : type === "action" ? "[ACTION]" : "[SYSTEM]";
    setLogs(prev => [...prev.slice(-12), `${prefix} ${msg}`]);
  };

  const fetchStatus = async () => {
    try {
      const data = await getJarvisStatus();
      if (data) {
        if (!status) addLog("Link to Head Gateway established.", "info");
        setStatus(data);
      } else {
        addLog("Failed to establish link to Head Gateway.", "error");
        setStatus(null);
      }
    } catch (err) {
      addLog("Link interrupted. Reconnecting...", "error");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    addLog("Initializing HUD...", "info");
    addLog("Establishing link to Gateway...", "info");
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleStartBrain = async () => {
    setIsActivating(true);
    addLog("Initiating Brain activation sequence...", "action");
    
    try {
      const success = await startBrain();
      if (success) {
        addLog("Activation command received. Warming up cores...", "info");
        // Poll faster for 1 minute
        let pings = 0;
        const poll = setInterval(async () => {
          await fetchStatus();
          pings++;
          if (pings > 10 || status?.brain_status === "RUNNING") {
            clearInterval(poll);
            setIsActivating(false);
          }
        }, 5000);
      } else {
        addLog("Brain activation protocol failed.", "error");
        setIsActivating(false);
      }
    } catch (err) {
      addLog("Critical failure in transmission.", "error");
      setIsActivating(false);
    }
  };

  const systemsNominal = status?.systems_nominal ?? false;

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-mono p-6">
      {/* Scanline Effect */}
      <div className="scanline" />
      
      {/* HUD Header */}
      <div className="flex justify-between items-start mb-12 border-b border-stark-cyan/20 pb-4">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-1"
        >
          <div className="text-stark-cyan flex items-center gap-2 stark-glow">
            <ShieldCheck size={20} />
            <span className="text-xl font-bold tracking-widest uppercase">JARVIS System HUD</span>
          </div>
          <div className="text-xs text-stark-cyan/60 flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe size={12} /> PROTOCOL: STARK-X1</span>
            <span className="flex items-center gap-1"><Activity size={12} /> ENCRYPTION: ACTIVE</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-right"
        >
          <div className="text-stark-cyan text-2xl stark-glow flex items-center gap-2 justify-end">
            <Clock size={24} />
            {currentTime}
          </div>
          <div className="text-xs text-stark-cyan/60 uppercase tracking-tighter">
            Region: US-CENTRAL / ASIA-SOUTH
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Status Panels */}
        <div className="space-y-6">
          <StatusCard 
            title="Head Gateway" 
            status={status?.head_status || "OFFLINE"} 
            icon={<Cpu className="text-stark-cyan" />}
            ip="34.69.30.127"
            active={status?.head_status === "RUNNING"}
          />
          <StatusCard 
            title="Aristotle Brain" 
            status={status?.brain_status || "UNREACHABLE"} 
            icon={<Activity className="text-stark-cyan" />}
            ip="34.93.105.44"
            active={status?.brain_status === "RUNNING"}
            warning={status?.brain_status === "TERMINATED"}
          />
        </div>

        {/* Center: Arc Reactor / Action */}
        <div className="flex flex-col items-center justify-center space-y-12">
          <div className="relative group">
            {/* Outer Rotating Circles */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-dashed border-stark-cyan/20 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 border border-stark-cyan/10 rounded-full"
            />
            
            <button
              onClick={handleStartBrain}
              disabled={isActivating || status?.brain_status === "RUNNING"}
              className={`
                relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2
                transition-all duration-500 stark-border
                ${status?.brain_status === "RUNNING" ? "bg-stark-cyan/20 border-stark-cyan" : "bg-stark-cyan/5 border-stark-cyan/40 hover:bg-stark-cyan/10"}
                ${isActivating ? "animate-pulse" : ""}
              `}
            >
              <Power size={48} className={status?.brain_status === "RUNNING" ? "text-stark-cyan stark-glow" : "text-stark-cyan/60"} />
              <span className="text-xs font-bold tracking-widest text-stark-cyan/80">
                {isActivating ? "WAKING..." : status?.brain_status === "RUNNING" ? "ACTIVE" : "START BRAIN"}
              </span>
              
              {/* Inner Glow */}
              <div className={`absolute inset-4 rounded-full border-2 border-stark-cyan/20 ${status?.brain_status === "RUNNING" ? "animate-pulse-cyan" : ""}`} />
            </button>
          </div>

          <div className="w-full stark-border bg-black/40 backdrop-blur-md p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Zap className={systemsNominal ? "text-stark-cyan" : "text-stark-red"} size={20} />
               <span className="text-sm text-stark-cyan/80">SYSTEMS INTEGRITY</span>
             </div>
             <span className={`text-sm font-bold ${systemsNominal ? "text-stark-cyan stark-glow" : "text-stark-red animate-pulse"}`}>
               {systemsNominal ? "NOMINAL" : "DEGRADED"}
             </span>
          </div>
        </div>

        {/* Right Column: Terminal Logs */}
        <div className="stark-border bg-black/60 backdrop-blur-md p-4 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-4 text-stark-cyan/80 border-b border-stark-cyan/10 pb-2">
            <Terminal size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Diagnostic Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-[10px] text-stark-cyan/70 scrollbar-hide">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-4 pt-2 border-t border-stark-cyan/10 text-[9px] flex justify-between uppercase">
            <span>Mode: Tactical</span>
            <span>Ver: 4.2.0-Alpha</span>
          </div>
        </div>

      </div>

      {/* Decorative HUD corners */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-stark-cyan/20 m-4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-stark-cyan/20 m-4 pointer-events-none" />
    </main>
  );
}

function StatusCard({ title, status, icon, ip, active, warning }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`stark-border bg-black/40 backdrop-blur-md p-4 relative overflow-hidden transition-colors ${active ? "border-stark-cyan/50" : "border-stark-cyan/10"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`p-2 rounded-lg bg-stark-cyan/10 ${active ? "animate-pulse" : ""}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-bold text-stark-cyan/80 uppercase tracking-widest">{title}</h3>
            <p className="text-[10px] text-stark-cyan/40 mt-1">IPV4: {ip}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            active ? "text-stark-cyan border-stark-cyan/40 bg-stark-cyan/10" : 
            warning ? "text-stark-red border-stark-red/40 bg-stark-red/10" :
            "text-stark-cyan/20 border-stark-cyan/10"
          }`}>
            {status}
          </div>
        </div>
      </div>
      
      {/* Background Decorative Line */}
      <div className={`absolute bottom-0 left-0 h-0.5 bg-stark-cyan/30 transition-all duration-1000 ${active ? "w-full" : "w-0"}`} />
    </motion.div>
  );
}
