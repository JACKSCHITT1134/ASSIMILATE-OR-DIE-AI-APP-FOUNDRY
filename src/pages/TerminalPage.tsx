import { useState } from "react";
import TerminalEmulator, { type TerminalEnv } from "@/components/features/TerminalEmulator";

const ENV_META = {
  termux: {
    label: "Termux",
    icon: "📱",
    tag: "Android · aarch64",
    color: "text-green-400",
    border: "border-green-500/40",
    activeBg: "bg-green-500/10",
    badgeBg: "bg-green-500/15 text-green-300",
    desc: "Termux App Foundry — full Linux environment on Android with all Colossal AI Hive capabilities.",
    details: [
      "pkg package manager",
      "termux-api integration",
      "Android sensors & camera",
      "Node.js · Python · Git · SSH",
      "All 6 hive agents active",
    ],
  },
  gentoo: {
    label: "Gentoo Linux",
    icon: "🐧",
    tag: "x86_64 · Portage · OpenRC",
    color: "text-purple-400",
    border: "border-purple-500/40",
    activeBg: "bg-purple-500/10",
    badgeBg: "bg-purple-500/15 text-purple-300",
    desc: "Gentoo Linux App Foundry — source-based distro with full Portage, compilation control, and Colossal AI Hive.",
    details: [
      "emerge / Portage package manager",
      "USE flags & source compilation",
      "OpenRC init system",
      "Custom kernel (genkernel)",
      "All 6 hive agents active",
    ],
  },
} as const;

export default function TerminalPage() {
  const [activeEnv, setActiveEnv] = useState<TerminalEnv>("termux");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const meta = ENV_META[activeEnv];

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-black">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div className="flex-shrink-0 border-b border-white/10 bg-zinc-950/90">
          <div className="max-w-screen-xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3">
            {/* Env tabs */}
            <div className="flex gap-1 flex-shrink-0">
              {(["termux", "gentoo"] as TerminalEnv[]).map((env) => {
                const m = ENV_META[env];
                return (
                  <button
                    key={env}
                    onClick={() => setActiveEnv(env)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all border ${
                      activeEnv === env
                        ? `${m.activeBg} ${m.border} ${m.color}`
                        : "text-white/40 border-white/10 hover:text-white/70 hover:border-white/20"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                    {activeEnv === env && (
                      <span className={`text-xs px-1 rounded ${m.badgeBg} ml-1 hidden sm:inline`}>
                        {m.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info */}
            <div className="hidden md:flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-xs font-mono ${meta.color} opacity-70`}>
                {meta.desc}
              </span>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-green-400/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                HIVE ACTIVE
              </span>
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-cyan-400/60">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                MEMORY REFINERY ON
              </span>
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-2 py-1 rounded text-xs font-mono text-white/40 border border-white/10 hover:text-white/70 hover:border-white/30 transition-all"
                title="Fullscreen terminal"
              >
                ⛶ Full
              </button>
            </div>
          </div>

          {/* Feature badges row */}
          <div className="max-w-screen-xl mx-auto px-4 pb-2 flex flex-wrap gap-1.5">
            {meta.details.map((d) => (
              <span
                key={d}
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${meta.badgeBg} border ${meta.border}`}
              >
                {d}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-red-500/10 text-red-400/70 border border-red-500/20">
              ↑↓ history · Ctrl+L clear · Ctrl+C interrupt
            </span>
          </div>
        </div>
      )}

      {/* ── Terminal ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-2 right-3 z-10 px-2 py-1 rounded text-xs font-mono text-white/30 border border-white/10 hover:text-white/60 hover:border-white/20 transition-all bg-black/80"
          >
            ✕ Exit Full
          </button>
        )}
        <TerminalEmulator key={activeEnv} env={activeEnv} />
      </div>

      {/* ── Bottom status bar ────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div className="flex-shrink-0 border-t border-white/5 bg-zinc-950/80 px-4 py-1 flex items-center gap-4 text-xs font-mono text-white/25">
          <span>{meta.icon} {meta.label} · {meta.tag}</span>
          <span>·</span>
          <span>OpenClaw Prime v3.0</span>
          <span>·</span>
          <span>KRACKERJACK1134</span>
          <span>·</span>
          <span className="text-green-400/40">Memory Refinery: ACTIVATED</span>
          <span className="ml-auto">type 'help' for commands</span>
        </div>
      )}
    </div>
  );
}
