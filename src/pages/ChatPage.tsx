import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import ChatMessage from "@/components/features/ChatMessage";
import AgentStatusBar from "@/components/features/AgentStatusBar";
import SelfImprovementPanel from "@/components/features/SelfImprovementPanel";
import { openClawRespond, buildMessage, detectNewCapability } from "@/lib/openclaw";
import type { AgentName, AgentStatus } from "@/types";
import { generateId } from "@/lib/utils";
import { PRIME_DIRECTIVE } from "@/constants";
import openclawAvatar from "@/assets/openclaw-avatar.png";

const QUICK_PROMPTS = [
  "I want to build a subscription app",
  "Build me a marketplace for freelancers",
  "Create an AI-powered fitness tracker",
  "Make a SaaS tool for small businesses",
  "Who are you and what's the Prime Directive?",
];

export default function ChatPage() {
  const store = useAppStore();
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName>("openclaw");
  const [agentStatuses, setAgentStatuses] = useState<Partial<Record<AgentName, AgentStatus>>>({});
  const [showPrimeDirective, setShowPrimeDirective] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-greet on first load
  useEffect(() => {
    if (store.messages.length === 0) {
      setTimeout(() => {
        triggerOpenClaw("", true);
      }, 400);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.messages]);

  const setAgentStatus = (agent: AgentName, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [agent]: status }));
  };

  const triggerOpenClaw = async (userText: string, isGreeting = false) => {
    if (!isGreeting) {
      const userMsg = buildMessage("user", userText);
      store.addMessage(userMsg);
    }

    setIsThinking(true);
    setActiveAgent("openclaw");
    setAgentStatus("openclaw", "thinking");

    const cap = detectNewCapability(userText);
    if (cap) {
      store.addModule({ name: cap.module, description: cap.description, status: "integrating" });
      setTimeout(() => {
        store.addModule({ name: cap.module, description: cap.description, status: "active" });
      }, 3000);
    }

    try {
      const response = await openClawRespond(userText, store.phase, store.appIdea);

      if (!isGreeting) {
        store.setAppIdea(userText);
      }

      if (response.nextPhase) {
        store.setPhase(response.nextPhase);
      }

      const agentId = response.agentId ?? "openclaw";
      setActiveAgent(agentId);
      setAgentStatus("openclaw", "done");
      setAgentStatus(agentId, "working");

      const aiMsg = buildMessage("openclaw", response.content, agentId);
      store.addMessage(aiMsg);

      setTimeout(() => {
        setAgentStatus(agentId, "done");
        setIsThinking(false);
      }, 800);
    } catch (err) {
      console.error("[ChatPage] OpenClaw error:", err);
      toast.error("OpenClaw encountered an error. Retrying...");
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
        {/* Agent status bar */}
        <AgentStatusBar activeAgent={activeAgent} agentStatuses={agentStatuses} />

        {/* Messages */}
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
                <div className="text-xl font-bold gradient-text mb-2">OpenClaw Prime</div>
                <div className="text-muted-foreground text-sm max-w-sm">
                  Zero-knowledge. Full autonomy. Tell me your idea and I'll build the business.
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
              <img src={openclawAvatar} alt="OpenClaw" className="w-8 h-8 rounded-full border border-primary/40 flex-shrink-0 mt-1" />
              <div className="glass-panel rounded-xl rounded-tl-sm px-4 py-3">
                <div className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">OpenClaw Prime</div>
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60"
                      style={{ animation: `pulse-glow 1.2s ease-in-out infinite ${i * 0.2}s` }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 font-mono">Processing...</span>
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
              Enter to send · Shift+Enter for new line · Prime Directive active
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="hidden lg:flex flex-col w-72 border-l border-border overflow-y-auto p-4 gap-4">
        {/* Prime Directive toggle */}
        <div>
          <button
            onClick={() => setShowPrimeDirective(!showPrimeDirective)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-200"
          >
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
              Prime Directive
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
              <span className="text-foreground">{store.modules.filter(m => m.status === "active").length} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
