import { useState, useCallback } from "react";
import TerminalEmulator, { type TerminalEnv } from "@/components/features/TerminalEmulator";
import PackageManagerPanel from "@/components/features/PackageManagerPanel";

// ── Environment metadata ──────────────────────────────────────────────────────
const ENV_META = {
  termux: {
    label: "Termux",
    fullLabel: "Termux App Foundry",
    icon: "📱",
    tag: "Android · aarch64",
    color: "text-green-400",
    border: "border-green-500/40",
    activeBg: "bg-green-500/10",
    tileBg: "bg-gradient-to-br from-green-950/80 to-black",
    tileBorder: "border-green-500/50",
    tileHover: "hover:border-green-400/70 hover:from-green-900/60",
    badgeBg: "bg-green-500/15 text-green-300 border-green-500/30",
    glow: "shadow-[0_0_30px_rgba(0,255,136,0.12)]",
    hiveColor: "text-green-300",
    desc: "Full Linux environment on Android with Termux API, pkg package manager, and the entire Colossal AI Hive.",
    details: [
      { icon: "📦", text: "pkg package manager" },
      { icon: "📱", text: "termux-api Android hooks" },
      { icon: "🐍", text: "Python · Node · Go · Rust" },
      { icon: "🔒", text: "SSH · nmap · metasploit" },
      { icon: "⚡", text: "All 6 hive agents active" },
      { icon: "🧠", text: "Memory Refinery ON" },
    ],
    promptDemo: "u0_a123@localhost:~ $",
  },
  gentoo: {
    label: "Gentoo",
    fullLabel: "Gentoo Linux Foundry",
    icon: "🐧",
    tag: "x86_64 · Portage · OpenRC",
    color: "text-purple-400",
    border: "border-purple-500/40",
    activeBg: "bg-purple-500/10",
    tileBg: "bg-gradient-to-br from-purple-950/80 to-black",
    tileBorder: "border-purple-500/50",
    tileHover: "hover:border-purple-400/70 hover:from-purple-900/60",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.12)]",
    hiveColor: "text-purple-300",
    desc: "Source-based rolling release Linux with full Portage control, USE flags, custom kernel, and Colossal AI Hive.",
    details: [
      { icon: "📦", text: "emerge / Portage" },
      { icon: "⚙️", text: "USE flags · make.conf" },
      { icon: "🔧", text: "Custom kernel (genkernel)" },
      { icon: "🚦", text: "OpenRC init system" },
      { icon: "⚡", text: "All 6 hive agents active" },
      { icon: "🧠", text: "Memory Refinery ON" },
    ],
    promptDemo: "root@colossal /root #",
  },
} as const;

type ViewMode = "selector" | "terminal";

export default function TerminalPage() {
  const [activeEnv, setActiveEnv] = useState<TerminalEnv | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("selector");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPkgMgr, setShowPkgMgr] = useState(true);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const handleLaunch = useCallback((env: TerminalEnv) => {
    setActiveEnv(env);
    setViewMode("terminal");
  }, []);

  const handleSwitchEnv = useCallback((env: TerminalEnv) => {
    setActiveEnv(env);
    // Key changes on TerminalEmulator via `key={activeEnv}` so banner resets automatically
  }, []);

  const handlePkgCommand = useCallback((cmd: string) => {
    setPendingCommand(cmd);
  }, []);

  const handleCommandConsumed = useCallback(() => {
    setPendingCommand(null);
  }, []);

  const meta = activeEnv ? ENV_META[activeEnv] : null;

  // ── SELECTOR VIEW ────────────────────────────────────────────────────────────
  if (viewMode === "selector") {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-black flex flex-col">
        {/* Hero header */}
        <div className="text-center px-6 pt-12 pb-8">
          <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-2">
            Colossal AI · Terminal Module
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Terminal Environment
            </span>
          </h1>
          <p className="text-white/40 text-sm max-w-lg mx-auto font-mono">
            Both environments carry the full Colossal AI Hive — 6 agents, Memory Refinery,
            Prime Directive v3.0 active. Pick your base.
          </p>
        </div>

        {/* Env tiles */}
        <div className="flex-1 flex items-start justify-center px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            {(["termux", "gentoo"] as TerminalEnv[]).map((env) => {
              const m = ENV_META[env];
              return (
                <button
                  key={env}
                  onClick={() => handleLaunch(env)}
                  className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer group ${m.tileBg} ${m.tileBorder} ${m.tileHover} ${m.glow} hover:scale-[1.02]`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">{m.icon}</span>
                        <div>
                          <div className={`font-black text-xl ${m.color}`}>{m.label}</div>
                          <div className="text-white/40 text-xs font-mono">{m.tag}</div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${m.badgeBg}`}>
                      HIVE ACTIVE
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-white/50 text-sm mb-4 leading-relaxed">{m.desc}</p>

                  {/* Feature list */}
                  <div className="grid grid-cols-2 gap-1.5 mb-5">
                    {m.details.map((d) => (
                      <div key={d.text} className="flex items-center gap-1.5 text-xs text-white/50">
                        <span>{d.icon}</span>
                        <span className="truncate">{d.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fake prompt preview */}
                  <div className="rounded-lg bg-black/60 border border-white/10 px-3 py-2 font-mono text-xs mb-4">
                    <span className={m.color}>{m.promptDemo} </span>
                    <span className="text-white/60">hive architect build me an app</span>
                    <span className="animate-pulse text-white/80">_</span>
                  </div>

                  {/* Launch button */}
                  <div
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${m.activeBg} ${m.border} ${m.color} group-hover:opacity-100`}
                  >
                    <span>Launch {m.label} Terminal</span>
                    <span className="text-base">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="flex-shrink-0 border-t border-white/5 bg-zinc-950/80 px-6 py-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/20">
          <span>⚡ OpenClaw Prime v3.0</span>
          <span>·</span>
          <span>🧠 Memory Refinery: ACTIVATED</span>
          <span>·</span>
          <span>⬡ Collective Assimilation: ON</span>
          <span>·</span>
          <span>🔴 Zero-Mistake Mode: ON</span>
          <span>·</span>
          <span>KRACKERJACK1134</span>
        </div>
      </div>
    );
  }

  // ── TERMINAL VIEW ────────────────────────────────────────────────────────────
  if (!meta || !activeEnv) return null;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-black">
      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div className="flex-shrink-0 border-b border-white/10 bg-zinc-950/95">
          <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
            {/* Back to selector */}
            <button
              onClick={() => setViewMode("selector")}
              className="flex items-center gap-1 px-2 py-1 rounded border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs font-mono transition-all"
              title="Back to environment selector"
            >
              ← Select Env
            </button>

            {/* Env switch tabs */}
            <div className="flex gap-1">
              {(["termux", "gentoo"] as TerminalEnv[]).map((env) => {
                const m = ENV_META[env];
                return (
                  <button
                    key={env}
                    onClick={() => handleSwitchEnv(env)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-medium transition-all ${
                      activeEnv === env
                        ? `${m.activeBg} ${m.border} ${m.color}`
                        : "text-white/30 border-white/10 hover:text-white/60 hover:border-white/25"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                    {activeEnv === env && (
                      <span className={`hidden sm:inline text-xs px-1 rounded ${m.badgeBg} border ml-0.5`}>
                        {m.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active env label */}
            <div className={`hidden md:block text-xs font-mono ${meta.color} opacity-60 flex-1 truncate`}>
              {meta.fullLabel} · Prime Directive v3.0 · Memory Refinery ON
            </div>

            {/* Right controls */}
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-green-400/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                HIVE
              </span>
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-cyan-400/50">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                REFINERY
              </span>
              <button
                onClick={() => setShowPkgMgr((p) => !p)}
                className={`px-2 py-1 rounded border text-xs font-mono transition-all ${
                  showPkgMgr
                    ? `${meta.activeBg} ${meta.border} ${meta.color}`
                    : "text-white/30 border-white/10 hover:text-white/60"
                }`}
                title="Toggle Package Manager"
              >
                📦 Pkg Mgr
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-2 py-1 rounded border text-xs font-mono text-white/30 border-white/10 hover:text-white/60 hover:border-white/25 transition-all"
                title="Fullscreen terminal"
              >
                ⛶ Full
              </button>
            </div>
          </div>

          {/* Feature badges */}
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {meta.details.map((d) => (
              <span
                key={d.text}
                className={`text-xs px-1.5 py-0.5 rounded-full font-mono border ${meta.badgeBg}`}
              >
                {d.icon} {d.text}
              </span>
            ))}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-mono bg-red-500/10 text-red-400/60 border border-red-500/20">
              ↑↓ history · Ctrl+L clear · Ctrl+C stop
            </span>
          </div>
        </div>
      )}

      {/* ── Main content: terminal + optional pkg manager ──────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Exit fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-2 right-3 z-20 px-2 py-1 rounded text-xs font-mono text-white/30 border border-white/10 hover:text-white/60 bg-black/80 transition-all"
          >
            ✕ Exit Full
          </button>
        )}

        {/* Terminal */}
        <div className="flex-1 min-w-0">
          <TerminalEmulator
            key={activeEnv}
            env={activeEnv}
            externalCommand={pendingCommand}
            onExternalCommandConsumed={handleCommandConsumed}
          />
        </div>

        {/* Package manager panel */}
        {showPkgMgr && !isFullscreen && (
          <div className="w-56 flex-shrink-0 flex flex-col">
            <PackageManagerPanel env={activeEnv} onRunCommand={handlePkgCommand} />
          </div>
        )}
      </div>

      {/* ── Bottom status bar ────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <div className="flex-shrink-0 border-t border-white/5 bg-zinc-950/80 px-3 py-1 flex items-center gap-3 text-xs font-mono text-white/20">
          <span>{meta.icon} {meta.label} · {meta.tag}</span>
          <span>·</span>
          <span>OpenClaw v3.0</span>
          <span>·</span>
          <span className="text-green-400/40">Memory Refinery: ACTIVATED</span>
          <span className="ml-auto">type 'help' for all commands</span>
        </div>
      )}
    </div>
  );
}
