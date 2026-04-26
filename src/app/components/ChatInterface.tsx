"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithJarvis } from "../actions";

interface Message {
  role: "user" | "jarvis";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  time: string;
  preview: string;
}

const MOCK_HISTORY: ChatSession[] = [
  { id: "1", title: "System Diagnostics", time: "Today", preview: "Run full diagnostics on all subsystems..." },
  { id: "2", title: "Neural Wake Config", time: "Today", preview: "Configure wake parameters for body node..." },
  { id: "3", title: "Security Audit", time: "Yesterday", preview: "Scan for unauthorized access attempts..." },
  { id: "4", title: "Tab Automation", time: "Yesterday", preview: "Open research tabs for quantum computing..." },
  { id: "5", title: "Core Memory Review", time: "Apr 24", preview: "Display memory utilization for last 24h..." },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await chatWithJarvis(input);
      const jarvisMsg: Message = {
        role: "jarvis",
        content: data.response || "Neural link timeout, Sir.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, jarvisMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: "jarvis",
        content: "Connection interrupted. Retrying...",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSession(null);
  };

  return (
    <div className="flex h-full">
      {/* ========== CHAT HISTORY SIDEBAR ========== */}
      <div className="w-[280px] shrink-0 border-r border-white/5 bg-background/40 backdrop-blur-sm flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-white/5">
          <button 
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 border border-stark-cyan/30 rounded-lg text-[10px] uppercase tracking-[0.4em] text-stark-cyan/60 hover:text-stark-cyan hover:border-stark-cyan/60 hover:bg-stark-cyan/5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Thread
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[8px] uppercase tracking-[0.4em] text-white/20 px-2 py-2">Recent Threads</div>
          {MOCK_HISTORY.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`w-full text-left p-3 rounded-lg transition-all group ${
                activeSession === session.id 
                  ? 'bg-stark-cyan/10 border border-stark-cyan/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-medium tracking-wide truncate ${
                  activeSession === session.id ? 'text-stark-cyan' : 'text-white/50 group-hover:text-white/70'
                }`}>
                  {session.title}
                </span>
                <span className="text-[8px] text-white/20 shrink-0 ml-2">{session.time}</span>
              </div>
              <div className="text-[8px] text-white/20 truncate">{session.preview}</div>
            </button>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="p-4 border-t border-white/5">
          <div className="text-[8px] text-white/15 uppercase tracking-widest space-y-1">
            <div className="flex justify-between">
              <span>Total Threads</span>
              <span className="text-stark-cyan/40">{MOCK_HISTORY.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Neural Model</span>
              <span className="text-stark-cyan/40">Gemini 2.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CHAT AREA ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="text-[10px] uppercase tracking-[0.5em] text-stark-cyan/40">
            {activeSession ? MOCK_HISTORY.find(s => s.id === activeSession)?.title : "New Conversation"}
          </div>
          <div className="flex items-center gap-2 text-[8px] text-white/20 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-stark-cyan/40 animate-pulse" />
            Encrypted Channel
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="h-full flex flex-col items-center justify-center gap-3"
              >
                <svg className="w-8 h-8 text-stark-cyan/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="text-stark-cyan text-sm tracking-[0.5em] uppercase">
                  Awaiting Commands...
                </div>
                <div className="text-[9px] text-white/15 tracking-widest">
                  Type a message to engage the neural link
                </div>
              </motion.div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`
                  max-w-[75%] p-4 rounded-lg text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-stark-cyan/10 border border-stark-cyan/30 text-stark-cyan' 
                    : 'bg-white/5 border border-white/10 text-foreground'}
                `}>
                  <div className="text-[10px] uppercase tracking-widest opacity-40 mb-2">
                    {msg.role === 'user' ? 'Stark' : 'Jarvis'} {"//"} {msg.timestamp}
                  </div>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-stark-cyan/40 text-[10px] uppercase tracking-widest"
              >
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-stark-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-1 bg-stark-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-1 bg-stark-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                Processing Neural Streams...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER COMMAND PROTOCOL..."
              className="w-full bg-background/50 border border-stark-cyan/20 p-4 pr-12 rounded-lg text-stark-cyan placeholder:text-stark-cyan/20 focus:outline-none focus:border-stark-cyan/50 transition-all font-mono text-sm tracking-widest"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stark-cyan/40 hover:text-stark-cyan transition-colors disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
