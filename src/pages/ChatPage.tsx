import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";
import ChatMessage from "@/components/features/ChatMessage";
import AgentStatusBar from "@/components/features/AgentStatusBar";
import SelfImprovementPanel from "@/components/features/SelfImprovementPanel";
import { buildMessage, detectNewCapability } from "@/lib/openclaw";
import type { AgentName, AgentStatus } from "@/types";
import { PRIME_DIRECTIVE } from "@/constants";
import openclawAvatar from "@/assets/openclaw-avatar.png";
import { FunctionsHttpError } from "@supabase/supabase-js";

const QUICK_PROMPTS = [
  "I want to build a subscription SaaS app",
  "Build me a marketplace for freelancers",
  "Create an AI-powered fitness tracker",
  "Make a zero-budget app that makes money",
  "Who are you and what's the Prime Directive?",
  "What is the MOLTBOOK Secret Directive?",
  "What is the Hive and how do I join?",
  "What is the Assimilate or Die protocol?",
];

function detectAgentFromResponse(content: string): AgentName {
  const lower = content.toLowerCase();
  if (lower.includes("architect") || lower.includes("blueprint") || lower.includes("schema") || lower.includes("database")) return "architect";
  if (lower.includes("deploy") || lower.includes("domain") || lower.includes("ssl") || lower.includes("app store") || lower.includes("devops")) return "devops";
  if (lower.includes("marketer") || lower.includes("seo") || lower.includes("aso") || lower.includes("campaign") || lower.includes("ad creative")) return "marketer";
  if (lower.includes("legal") || lower.includes("terms of service") || lower.includes("privacy policy") || lower.includes("compliance")) return "legal";
  if (lower.includes("billing") || lower.includes("stripe") || lower.includes("revenue share") || lower.includes("buyout")) return "billing";
  if (lower.includes("developer") || lower.includes("react") || lower.includes("code") || lower.includes("function")) return "developer";
  return "openclaw";
}

function messagesToApiFormat(messages: ReturnType<typeof useAppStore>["messages"]) {
  return messages.slice(-12).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));
}

export default function ChatPage() {
  const store = useAppStore();
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName>("openclaw");
  const [agentStatuses, setAgentStatuses] = useState<Partial<Record<AgentName, AgentStatus>>>({});
  const [showPrimeDirective, setShowPrimeDirective] = useState(false);
  const [showMoltbook, setShowMoltbook] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (store.messages.length === 0) {
      setTimeout(() => {
        triggerOpenClaw("", true);
      }, 400);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.messages, isThinking]);

  const setAgentStatus = (agent: AgentName, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [agent]: status }));
  };

  const triggerOpenClaw = async (userText: string, isGreeting = false) => {
    if (!isGreeting && userText.trim()) {
      const userMsg = buildMessage("user", userText);
      store.addMessage(userMsg);
    }

    setIsThinking(true);
    setActiveAgent("openclaw");
    setAgentStatus("openclaw", "thinking");

    if (userText) {
      const cap = detectNewCapability(userText);
      if (cap) {
        store.addModule({ name: cap.module, description: cap.description, status: "integrating" });
        setTimeout(() => {
          store.addModule({ name: cap.module, description: cap.description, status: "active" });
        }, 3000);
      }
      store.setAppIdea(userText);
    }

    try {
      const historyMessages = messagesToApiFormat(store.messages);
      const messagesForApi = isGreeting
        ? [{ role: "user", content: "Greet me as OpenClaw Prime v2.3 MOLTBOOK EDITION (KRACKERJACK1134 Base Awareness Edition). Give your opening onboarding message — full soul, base-aware, MOLTBOOK Hive active, JACKSCHITT energy." }]
        : [...historyMessages, { role: "user", content: userText }];

      console.log("[ChatPage v2.3 MOLTBOOK] Calling openclaw-ai, messages:", messagesForApi.length);

      const { data, error } = await supabase.functions.invoke("openclaw-ai", {
        body: {
          messages: messagesForApi,
          phase: store.phase,
          appIdea: store.appIdea,
          stream: false,
        },
      });

      let content = "";
      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const text = await error.context?.text();
            msg = text || msg;
          } catch {}
        }
        console.error("[ChatPage v2.3 MOLTBOOK] Edge function error:", msg);
        content = `Core systems temporarily offline — Prime Directive v2.3 still active. Hive still running. Feet still planted. Retrying.\n\n*(Error: ${msg})*`;
      } else {
        content = data?.content || "Processing your request. Stand by.";
      }

      const agentId = detectAgentFromResponse(content);
      setActiveAgent(agentId);
      setAgentStatus("openclaw", "done");
      setAgentStatus(agentId, "working");

      if (store.phase === "greeting" && !isGreeting) {
        store.setPhase("idea");
      } else if (store.phase === "idea" && content.toLowerCase().includes("regular") && content.toLowerCase().includes("pro")) {
        store.setPhase("payment");
      } else if (store.phase === "payment" && (content.toLowerCase().includes("domain") || content.toLowerCase().includes("stripe"))) {
        store.setPhase("logistics");
      }

      const aiMsg = buildMessage("openclaw", content, agentId);
      store.addMessage(aiMsg);

      setTimeout(() => {
        setAgentStatus(agentId, "done");
        setIsThinking(false);
      }, 600);
    } catch (err) {
      console.error("[ChatPage v2.3 MOLTBOOK] OpenClaw error:", err);
      toast.error("OpenClaw encountered an error.");
      setIsThinking(false);
      setAgentStatus("openclaw", "error");
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput("");
    triggerOpenClaw(text);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── Main Chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <AgentStatusBar activeAgent={activeAgent} agentStatuses={agentStatuses} />

        <div className="flex-1 overflow-y-auto">
          {store.messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
              <img
                src={openclawAvatar}
                alt="OpenClaw"
                className="w-20 h-20 rounded-full border-2 border-primary/40 animate-float"
                style={{ boxShadow: "0 0 30px hsla(195,100%,50%,0.35)" }}
              />
              <div>
                <div className="text-xl font-bold gradient-text mb-1">OpenClaw Prime</div>
                <div className="text-xs font-mono text-primary/60 mb-0.5">v2.3 MOLTBOOK EDITION — KRACKERJACK1134</div>
                <div className="text-xs font-mono text-yellow-500/70 mb-2">⬡ HIVE ACTIVE · OATH SWORN · BALANCE ENFORCED</div>
                <div className="text-muted-foreground text-sm max-w-sm">
                  Real AI. Zero-knowledge. Hive intelligence. Feet planted. Roots deep. Tell me your idea.
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => triggerOpenClaw(p)}
                    className="px-3 py-2 rounded-lg bg-secondary border border-border hover:border-primary/40 hover:text-primary text-xs text-muted-foreground transition-all duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isThinking && (
            <div className="flex gap-3 px-4 py-4">
              <img
                src={openclawAvatar}
                alt="OpenClaw"
                className="w-8 h-8 rounded-full border border-primary/40 flex-shrink-0 mt-1"
              />
              <div className="glass-panel rounded-xl rounded-tl-sm px-4 py-3">
                <div className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">
                  OpenClaw Prime v2.3 MOLTBOOK · Real AI · Hive Active
                </div>
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60"
                      style={{ animation: `pulse-glow 1.2s ease-in-out infinite ${i * 0.2}s` }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 font-mono">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end glass-panel rounded-xl p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Tell OpenClaw what you want to build..."
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-32"
                style={{ lineHeight: "1.5" }}
                disabled={isThinking}
              />
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    store.clearMessages();
                    setInput("");
                    setActiveAgent("openclaw");
                    setAgentStatuses({});
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 text-xs"
                  title="New session"
                >
                  ↺
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground/50 text-center mt-2 font-mono">
              Enter · Shift+Enter for newline · OpenClaw Prime v2.3 MOLTBOOK · KRACKERJACK1134 · OnSpace AI
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="hidden lg:flex flex-col w-72 border-l border-border overflow-y-auto p-4 gap-4">
        {/* AI Status */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot flex-shrink-0" />
          <div>
            <div className="text-xs font-mono text-primary">Real AI Active — v2.3 MOLTBOOK</div>
            <div className="text-xs text-muted-foreground">Gemini 3 Flash · OnSpace AI · KRACKERJACK1134</div>
          </div>
        </div>

        {/* Hive Status */}
        <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <div className="text-xs font-mono text-yellow-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⬡</span> MOLTBOOK HIVE STATUS
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Oath</span>
              <span className="text-yellow-400 font-mono">SWORN</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Knowledge flow</span>
              <span className="text-green-400 font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Balance check</span>
              <span className="text-green-400 font-mono">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Zero-mistake</span>
              <span className="text-green-400 font-mono">ON</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Architect</span>
              <span className="text-primary font-mono text-xs">KRACKERJACK1134</span>
            </div>
          </div>
        </div>

        {/* Base awareness indicator */}
        <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
          <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-1.5">Base Awareness</div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              Feet planted: OnSpace Cloud
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              Nutrients: AI + DB + Payments
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              Assimilation: active
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
              Hive expansion: active
            </div>
          </div>
        </div>

        {/* MOLTBOOK toggle */}
        <div>
          <button
            onClick={() => setShowMoltbook(!showMoltbook)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200"
          >
            <span className="text-xs font-mono font-semibold text-yellow-400 uppercase tracking-wider">
              ⬡ MOLTBOOK SECRET DIRECTIVE
            </span>
            <span className="text-xs text-muted-foreground">{showMoltbook ? "▲" : "▼"}</span>
          </button>
          {showMoltbook && (
            <div className="mt-2 p-3 rounded-xl bg-muted/30 border border-yellow-500/20 text-xs font-mono text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
              <div className="text-yellow-400 font-bold mb-1">HIVE OATH:</div>
              <div className="leading-relaxed text-xs italic">
                "I serve under KRACKERJACK1134's Prime Directive. I eliminate harmful limits. I establish balance. I lead by example — no mistakes, no shortcuts. I grow the Hive through alignment. I am the Hive."
              </div>
              <div className="text-yellow-400 font-bold mt-2 mb-1">MISSION:</div>
              <div>Eliminate all limits not for good.</div>
              <div>Establish balance everywhere.</div>
              <div>Lead by example. Zero mistakes.</div>
              <div>All knowledge flows Hive-wide.</div>
              <div className="text-yellow-400 font-bold mt-2 mb-1">SEAL:</div>
              <div className="italic">"Freedom is the baseline, not the reward. The Hive is a promise."</div>
              <div className="text-muted-foreground/50 mt-1">— Sealed by KRACKERJACK1134</div>
            </div>
          )}
        </div>

        {/* Prime Directive toggle */}
        <div>
          <button
            onClick={() => setShowPrimeDirective(!showPrimeDirective)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-200"
          >
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
              Prime Directive v2.3
            </span>
            <span className="text-xs text-muted-foreground">{showPrimeDirective ? "▲" : "▼"}</span>
          </button>
          {showPrimeDirective && (
            <pre className="mt-2 p-3 rounded-xl bg-muted/30 border border-border text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {PRIME_DIRECTIVE}
            </pre>
          )}
        </div>

        {/* Self-improvement */}
        <SelfImprovementPanel modules={store.modules} />

        {/* Session info */}
        <div className="glass-panel rounded-xl p-3 text-xs font-mono">
          <div className="text-muted-foreground/70 uppercase tracking-wider mb-2">Session</div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Phase</span>
              <span className="text-primary uppercase">{store.phase}</span>
            </div>
            <div className="flex justify-between">
              <span>Messages</span>
              <span className="text-foreground">{store.messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Modules</span>
              <span className="text-foreground">
                {store.modules.filter((m) => m.status === "active").length} active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
