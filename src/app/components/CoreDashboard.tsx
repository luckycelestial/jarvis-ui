"use client";

import React from "react";
import { motion } from "framer-motion";

interface Integration {
  name: string;
  category: string;
  status: "online" | "offline" | "degraded" | "standby";
  description: string;
  version?: string;
  endpoint?: string;
}

const INTEGRATIONS: Integration[] = [
  // Core Infrastructure
  { name: "Head Node", category: "Infrastructure", status: "online", description: "Local gateway for hardware control & wake commands", version: "v4.2", endpoint: "localhost:5001" },
  { name: "Body Node", category: "Infrastructure", status: "standby", description: "GCP Cognition Engine running LLM inference", version: "v4.2", endpoint: "asia-south1-a" },
  { name: "Cloudflare Tunnel", category: "Infrastructure", status: "online", description: "Secure tunnel bridging Head → Body over public net", endpoint: "trycloudflare.com" },
  { name: "Vercel Edge", category: "Infrastructure", status: "online", description: "UI hosting with global CDN and serverless functions", endpoint: "jarvis-ui-weld.vercel.app" },

  // AI & Models
  { name: "Gemini 2.5 Pro", category: "AI Models", status: "standby", description: "Primary reasoning model for complex queries", version: "2.5-pro" },
  { name: "Gemini 2.5 Flash", category: "AI Models", status: "standby", description: "Fast model for real-time responses", version: "2.5-flash" },
  { name: "Embedding Model", category: "AI Models", status: "offline", description: "Vector embeddings for semantic search", version: "text-embedding-004" },

  // APIs & Services
  { name: "Google Search API", category: "APIs", status: "standby", description: "Web search for real-time information retrieval" },
  { name: "GitHub API", category: "APIs", status: "online", description: "Repository management and code operations", endpoint: "api.github.com" },
  { name: "Browser Automation", category: "APIs", status: "online", description: "Tab opening and local browser control via Head node" },

  // Data & Storage
  { name: "ChromaDB", category: "Storage", status: "offline", description: "Vector database for long-term memory", endpoint: "localhost:8000" },
  { name: "File System", category: "Storage", status: "online", description: "Local file read/write via Head node gateway" },
  { name: "Session Memory", category: "Storage", status: "standby", description: "In-memory conversation context for active sessions" },

  // Security
  { name: "API Key Auth", category: "Security", status: "online", description: "JARVIS_SECRET header validation on all endpoints" },
  { name: "TLS Encryption", category: "Security", status: "online", description: "End-to-end encryption on all tunnel traffic", version: "TLS 1.3" },
  { name: "CORS Policy", category: "Security", status: "online", description: "Strict origin validation on Body endpoints" },
];

const STATUS_CONFIG = {
  online: { color: "bg-stark-cyan", text: "text-stark-cyan", label: "ONLINE", glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]" },
  offline: { color: "bg-stark-red", text: "text-stark-red", label: "OFFLINE", glow: "" },
  degraded: { color: "bg-amber-400", text: "text-amber-400", label: "DEGRADED", glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]" },
  standby: { color: "bg-white/20", text: "text-white/40", label: "STANDBY", glow: "" },
};

function IntegrationCard({ integration, index }: { integration: Integration; index: number }) {
  const config = STATUS_CONFIG[integration.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="stark-border bg-black/40 rounded-lg p-4 backdrop-blur-sm hover:bg-white/[0.03] transition-colors group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color} ${config.glow}`} />
          <span className="text-[11px] text-white/70 font-medium tracking-wide group-hover:text-white/90 transition-colors">{integration.name}</span>
        </div>
        <span className={`text-[8px] font-bold tracking-[0.3em] uppercase ${config.text}`}>{config.label}</span>
      </div>
      <p className="text-[8px] text-white/20 leading-relaxed mb-2">{integration.description}</p>
      <div className="flex gap-3">
        {integration.version && (
          <span className="text-[7px] text-stark-cyan/30 uppercase tracking-wider">{integration.version}</span>
        )}
        {integration.endpoint && (
          <span className="text-[7px] text-white/15 uppercase tracking-wider truncate">{integration.endpoint}</span>
        )}
      </div>
    </motion.div>
  );
}

interface CoreDashboardProps {
  status: any;
}

export function CoreDashboard({ status }: CoreDashboardProps) {
  const bodyActive = status?.body_status === "RUNNING";
  const headActive = status?.head_status === "RUNNING" || status?.head_status === "ONLINE";

  const dynamicIntegrations: Integration[] = INTEGRATIONS.map(integration => {
    if (integration.name === "Head Node") {
      return { ...integration, status: headActive ? "online" : "offline" };
    }
    if (integration.name === "Body Node") {
      return { ...integration, status: bodyActive ? "online" : "standby" };
    }
    if (integration.category === "AI Models") {
      return { ...integration, status: bodyActive ? "online" : "standby" };
    }
    return integration;
  });

  const categories = [...new Set(dynamicIntegrations.map(i => i.category))];
  
  const counts = {
    online: dynamicIntegrations.filter(i => i.status === "online").length,
    standby: dynamicIntegrations.filter(i => i.status === "standby").length,
    offline: dynamicIntegrations.filter(i => i.status === "offline").length,
    degraded: dynamicIntegrations.filter(i => i.status === "degraded").length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with summary stats */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-stark-cyan/60 uppercase tracking-[0.5em] mb-1">Neural Engine Core</div>
          <div className="text-[8px] text-white/20 tracking-widest">Integration Health Monitor — {dynamicIntegrations.length} subsystems tracked</div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-stark-cyan">{counts.online}</div>
            <div className="text-[7px] text-stark-cyan/40 uppercase tracking-widest">Online</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/30">{counts.standby}</div>
            <div className="text-[7px] text-white/20 uppercase tracking-widest">Standby</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-stark-red">{counts.offline}</div>
            <div className="text-[7px] text-stark-red/40 uppercase tracking-widest">Offline</div>
          </div>
          {counts.degraded > 0 && (
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{counts.degraded}</div>
              <div className="text-[7px] text-amber-400/40 uppercase tracking-widest">Degraded</div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable integration grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {categories.map(category => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[9px] text-stark-cyan/40 uppercase tracking-[0.5em] font-bold">{category}</div>
              <div className="flex-1 h-px bg-white/5" />
              <div className="text-[8px] text-white/15">
                {dynamicIntegrations.filter(i => i.category === category).length} subsystems
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dynamicIntegrations.filter(i => i.category === category).map((integration, idx) => (
                <IntegrationCard key={integration.name} integration={integration} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
