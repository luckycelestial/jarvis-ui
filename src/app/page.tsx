`"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  MessageSquare,
  Send,
  Mic,
  Command,
  ChevronRight,
  Trash2,
  Brain,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  PanelTopClose
} from "lucide-react";
import { getJarvisStatus, startBrain, chatWithJarvis, runVMScript } from "./actions";

// --- Types ---
interface SystemStatus {
  brain_status: string;
  head_status: string;
  systems_nominal: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "jarvis";
  text: string;
  timestamp: Date;
}





export default function JarvisHUD() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [chatInput, setChatInput] = useState("");

  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Digital clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addLog = (msg: string, type: "info" | "error" | "action" = "info") => {
    const prefix = type === "error" ? "[ERROR]" : type === "action" ? "[ACTION]" : "[SYSTEM]";
    setLogs(prev => [...prev.slice(-8), `${ prefix } ${ msg } `]);
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
        let pings = 0;
        const poll = setInterval(async () => {
          await fetchStatus();
          pings++;
          if (pings > 12 || status?.brain_status === "RUNNING") {
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

  const triggerLocalCommand = (command: string, params: any) => {
    // Attempt to hit the LOCAL Head Gateway (running on user's device)
    // NOTE: If using Vercel (HTTPS), this may be blocked by browser Mixed Content rules.
    // User must "Allow Insecure Content" for this site in browser settings.
    fetch("http://localhost:8000/execute", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-API-KEY": "stark-neural-link-alpha-99"
      },
      body: JSON.stringify({ command, params })
    }).then(res => {
      if (res.ok) {
        addLog(`Local Command: ${ command } success.`, "action");
      } else {
        addLog(`Local Command: ${ command } failed(Link active but rejected).`, "error");
      }
    }).catch(() => {
      addLog("Local Link Offline. Check INITIATE_JARVIS_LINK.bat.", "info");
      addLog("Tip: Allow 'Insecure Content' in browser settings for local link.", "info");
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsgText = chatInput;
    setChatInput("");
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userMsgText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await chatWithJarvis(userMsgText);
      const rawResponse = result.response || "Sir, I encountered an error processing your request.";
      
      const jarvisMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        text: rawResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, jarvisMsg]);
      
      if (result.status === "error") {
        addLog("Neural link unstable.", "error");
      }
    } catch (err) {
      addLog("Neural link failed. Message dropped.", "error");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        text: "Sir, the connection to the neural core was severed. Please check the Head Gateway.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunVMScript = async () => {
    setIsRunningScript(true);
    addLog("Transmitting script execution request to Brain...", "action");
    try {
      const result = await runVMScript();
      if (result.success) {
        addLog("Brain: Script executed successfully.", "info");
      } else {
        addLog(`Brain: Script execution failed - ${ result.error } `, "error");
      }
    } catch (err) {
      addLog("Neural link timeout during script execution.", "error");
    } finally {
      setIsRunningScript(false);
    }
  };

  const systemsNominal = status?.systems_nominal ?? false;

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-mono p-4 md:p-6">
      {/* Scanline Effect */}
      <div className="scanline" />
      
      {/* HUD Header */}
      <div className="flex justify-between items-start mb-8 border-b border-stark-cyan/20 pb-4">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-1"
        >
          <div className="text-stark-cyan flex items-center gap-2 stark-glow">
            <ShieldCheck size={20} />
            <span className="text-lg md:text-xl font-bold tracking-widest uppercase">JARVIS System HUD</span>
          </div>
          <div className="text-[10px] text-stark-cyan/60 flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe size={10} /> PROTOCOL: STARK-X1</span>
            <span className="flex items-center gap-1"><Activity size={10} /> ENCRYPTION: ACTIVE</span>

          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-right"
        >
          <div className="text-stark-cyan text-xl md:text-2xl stark-glow flex items-center gap-2 justify-end">
            <Clock size={20} />
            {currentTime}
          </div>
          <div className="text-[10px] text-stark-cyan/60 uppercase tracking-tighter">
            Region: US-CENTRAL / ASIA-SOUTH
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        
        {/* Left Section: Status & Diagnostics (Col 1-3) */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
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
            icon={<Brain className="text-stark-cyan" />}
            ip="34.93.105.44"
            active={status?.brain_status === "RUNNING"}
            warning={status?.brain_status === "TERMINATED"}
          />
          
          <div className="stark-border bg-black/40 backdrop-blur-md p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stark-cyan/10 pb-2">
              <span className="text-[10px] font-bold text-stark-cyan/60 uppercase">Diagnostics</span>
              <Activity size={14} className="text-stark-cyan/40" />
            </div>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] text-stark-cyan/50 break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          <div className="stark-border bg-black/40 backdrop-blur-md p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Zap className={systemsNominal ? "text-stark-cyan" : "text-stark-red"} size={16} />
               <span className="text-[10px] text-stark-cyan/80">INTEGRITY</span>
             </div>
             <span className={`text - [10px] font - bold ${ systemsNominal ? "text-stark-cyan stark-glow" : "text-stark-red animate-pulse" } `}>
               {systemsNominal ? "NOMINAL" : "DEGRADED"}
             </span>
          </div>

          <button
            onClick={handleRunVMScript}
            disabled={isRunningScript || status?.brain_status !== "RUNNING"}
            className={`w - full py - 3 stark - border bg - stark - cyan / 5 flex items - center justify - center gap - 3 transition - all ${ isRunningScript ? "animate-pulse" : "hover:bg-stark-cyan/10" } `}
          >
            <Terminal size={16} className="text-stark-cyan" />
            <span className="text-[10px] font-bold tracking-widest text-stark-cyan uppercase">
              {isRunningScript ? "EXECUTING..." : "RUN VM SCRIPT"}
            </span>
          </button>
        </div>

        {/* Center: Arc Reactor & Primary Action (Col 4-7) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
          <div className="relative group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 border border-dashed border-stark-cyan/20 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-16 border border-stark-cyan/10 rounded-full"
            />
            
            <button
              onClick={handleStartBrain}
              disabled={isActivating || status?.brain_status === "RUNNING"}
              className={`
                relative w - 40 h - 40 md: w - 56 md: h - 56 rounded - full flex flex - col items - center justify - center gap - 2
transition - all duration - 500 stark - border z - 10
                ${ status?.brain_status === "RUNNING" ? "bg-stark-cyan/15 border-stark-cyan/60" : "bg-stark-cyan/5 border-stark-cyan/30 hover:bg-stark-cyan/10" }
                ${ isActivating ? "animate-pulse" : "" }
`}
            >
              <Power size={48} className={status?.brain_status === "RUNNING" ? "text-stark-cyan stark-glow" : "text-stark-cyan/40"} />
              <span className="text-[10px] font-bold tracking-[0.2em] text-stark-cyan/80">
                {isActivating ? "WAKING CORE..." : status?.brain_status === "RUNNING" ? "CORE ACTIVE" : "INITIATE BRAIN"}
              </span>
              
              <div className={`absolute inset - 4 rounded - full border border - stark - cyan / 10 ${ status?.brain_status === "RUNNING" ? "animate-pulse-cyan" : "" } `} />
            </button>
          </div>
        </div>

        {/* Right Section: Chat Interface (Col 8-12) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
          <div className="stark-border bg-black/60 backdrop-blur-xl flex-1 flex flex-col overflow-hidden relative border-stark-cyan/30 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
            <div className="flex items-center justify-between p-4 border-b border-stark-cyan/20 bg-stark-cyan/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MessageSquare size={18} className="text-stark-cyan" />
                  {isTyping && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-stark-cyan rounded-full"
                    />
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-stark-cyan stark-glow">Neural Link Terminal</span>
              </div>
              <button 
                onClick={() => setMessages([])}
                className="text-stark-cyan/40 hover:text-stark-red transition-colors p-1"
                title="Purge Intelligence History"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-stark-cyan space-y-2">
                  <Terminal size={40} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Awaiting Commands...</span>
                </div>
              )}
              
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    className={`flex ${ msg.role === "user" ? "justify-end" : "justify-start" } `}
                  >
                    <div className={`max - w - [85 %] group relative`}>
                      <div className={`
text - [11px] p - 3 border leading - relaxed
                        ${
  msg.role === "user"
  ? "bg-stark-cyan/10 border-stark-cyan/30 text-stark-cyan rounded-l-xl rounded-tr-xl"
  : "bg-black/40 border-stark-cyan/10 text-stark-cyan/80 rounded-r-xl rounded-tl-xl"
}
`}>
                        <div className="flex items-center gap-2 mb-1 opacity-40 text-[8px] font-bold uppercase">
                          {msg.role === "user" ? "Authorized User" : "JARVIS Intelligence"}
                          <span>•</span>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        {msg.text}
                      </div>
                      

                      
                      {/* Message corner decoration */}
                      <div className={`absolute top - 0 ${ msg.role === "user" ? "right-0 -mr-1" : "left-0 -ml-1" } w - 2 h - 2 border - t border - stark - cyan / 40`} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex justify-start"
                >
                  <div className="bg-black/20 border border-stark-cyan/5 p-3 rounded-r-xl rounded-tl-xl">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-stark-cyan/60 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* In-Chat Input */}
            <div className="p-4 border-t border-stark-cyan/10 bg-black/40">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <ChevronRight size={16} className="absolute left-3 text-stark-cyan/40" />
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="TRANSMIT COMMAND..."
                  className="w-full bg-stark-cyan/5 border border-stark-cyan/20 rounded-lg py-3 pl-10 pr-12 text-xs text-stark-cyan placeholder:text-stark-cyan/20 outline-none focus:border-stark-cyan/50 transition-all uppercase font-bold tracking-widest"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  className="absolute right-2 p-2 text-stark-cyan/60 hover:text-stark-cyan disabled:opacity-20 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-4 left-4 text-[8px] text-stark-cyan/20 uppercase tracking-[0.5em] pointer-events-none">
        Secure Neural Pipeline Active // Protocol 117-Alpha
      </div>
      
      {/* Decorative HUD corners */}
      <div className="fixed top-0 left-0 w-24 h-24 border-t border-l border-stark-cyan/10 m-2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-b border-r border-stark-cyan/10 m-2 pointer-events-none" />
    </main>
  );
}

function StatusCard({ title, status, icon, ip, active, warning }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`stark - border bg - black / 40 backdrop - blur - md p - 4 relative overflow - hidden transition - all ${ active ? "border-stark-cyan/40 bg-stark-cyan/5" : "border-stark-cyan/10" } `}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`p - 2 rounded - lg bg - stark - cyan / 10 ${ active ? "animate-pulse" : "" } `}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-stark-cyan/80 uppercase tracking-widest">{title}</h3>
            <p className="text-[8px] text-stark-cyan/40 mt-1 tracking-tighter">NODE: {ip}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text - [8px] font - bold px - 2 py - 0.5 rounded border ${
  active ? "text-stark-cyan border-stark-cyan/40 bg-stark-cyan/10 stark-glow" :
    warning ? "text-stark-red border-stark-red/40 bg-stark-red/10" :
      "text-stark-cyan/20 border-stark-cyan/10"
} `}>
            {status}
          </div>
        </div>
      </div>
      
      {/* Background Decorative Line */}
      <div className={`absolute bottom - 0 left - 0 h - [1px] bg - stark - cyan / 30 transition - all duration - 1000 ${ active ? "w-full" : "w-0" } `} />
    </motion.div>
  );
}
`