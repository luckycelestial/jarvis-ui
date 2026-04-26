"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithJarvis } from "../actions";

interface Message {
  role: "user" | "jarvis";
  content: string;
  timestamp: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-6 space-y-4">
      {/* Chat History Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-stark-cyan/20"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="h-full flex items-center justify-center text-stark-cyan text-sm tracking-[0.5em] uppercase"
            >
              Awaiting Commands...
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
                max-w-[80%] p-4 rounded-lg text-sm leading-relaxed
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
              <div className="w-1 h-1 bg-stark-cyan rounded-full animate-ping" />
              Processing Neural Streams...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ENTER COMMAND PROTOCOL..."
          className="w-full bg-background/50 border border-stark-cyan/20 p-4 rounded-lg text-stark-cyan placeholder:text-stark-cyan/20 focus:outline-none focus:border-stark-cyan/50 transition-all font-mono text-sm tracking-widest"
        />
        <button 
          onClick={handleSend}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stark-cyan/40 hover:text-stark-cyan transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
