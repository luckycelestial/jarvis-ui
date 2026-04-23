"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Cpu, 
  Power, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Globe, 
  Clock,
  AlertTriangle
} from "lucide-react";

const HEAD_IP = "34.69.30.127";
const HEAD_URL = `http://${HEAD_IP}:8000`;

export default function JarvisHUD() {
  const [headStatus, setHeadStatus] = useState("OFFLINE");
  const [brainStatus, setBrainStatus] = useState("UNKNOWN");
  const [systemsNominal, setSystemsNominal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Initializing HUD...", "[SYSTEM] Establishing link to Gateway..."]);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${HEAD_URL}/status`);
      const data = await res.json();
      setHeadStatus(data.head_status || "RUNNING");
      setBrainStatus(data.brain_status || "UNKNOWN");
      setSystemsNominal(data.systems_nominal || false);
      addLog(`[PING] Heartbeat received. Brain: ${data.brain_status}`);
    } catch (err) {
      setHeadStatus("OFFLINE");
      setBrainStatus("UNREACHABLE");
      setSystemsNominal(false);
      addLog("[ERROR] Failed to establish link to Head Gateway.");
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-9), msg]);
  };

  const initiateBrain = async () => {
    setLoading(true);
    addLog("[ACTION] Initiating Brain activation sequence...");
    try {
      const res = await fetch(`${HEAD_URL}/start_brain`, { method: "POST" });
      const data = await res.json();
      addLog(`[SYSTEM] ${data.message}`);
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      addLog("[ERROR] Brain activation protocol failed.");
    } finally {
      setLoading(false);
    }
  };

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
            status={headStatus} 
            icon={<Cpu className="text-stark-cyan" />}
            ip={HEAD_IP}
            active={headStatus === "RUNNING"}
          />
          <StatusCard 
            title="Aristotle Brain" 
            status={brainStatus} 
            icon={<Activity className="text-stark-cyan" />}
            ip="34.93.105.44"
            active={brainStatus === "RUNNING"}
            warning={brainStatus === "TERMINATED"}
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
              onClick={initiateBrain}
              disabled={loading || brainStatus === "RUNNING"}
              className={`
                relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2
                transition-all duration-500 stark-border
                ${brainStatus === "RUNNING" ? "bg-stark-cyan/20 border-stark-cyan" : "bg-stark-cyan/5 border-stark-cyan/40 hover:bg-stark-cyan/10"}
                ${loading ? "animate-pulse" : ""}
              `}
            >
              <Power size={48} className={brainStatus === "RUNNING" ? "text-stark-cyan stark-glow" : "text-stark-cyan/60"} />
              <span className="text-xs font-bold tracking-widest text-stark-cyan/80">
                {loading ? "WAKING..." : brainStatus === "RUNNING" ? "ACTIVE" : "START BRAIN"}
              </span>
              
              {/* Inner Glow */}
              <div className={`absolute inset-4 rounded-full border-2 border-stark-cyan/20 ${brainStatus === "RUNNING" ? "animate-pulse-cyan" : ""}`} />
            </button>
          </div>

          <div className="w-full stark-border bg-black/40 backdrop-blur-md p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Zap className={systemsNominal ? "text-stark-cyan" : "text-stark-red"} size={20} />
               <span className="text-sm">SYSTEMS INTEGRITY</span>
             </div>
             <span className={`text-sm font-bold ${systemsNominal ? "text-stark-cyan" : "text-stark-red"}`}>
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
