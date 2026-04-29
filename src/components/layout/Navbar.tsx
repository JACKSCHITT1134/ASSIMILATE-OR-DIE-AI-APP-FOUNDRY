import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import openclawAvatar from "@/assets/openclaw-avatar.png";

const NAV_LINKS = [
  { href: "/command", label: "Command", icon: "⚡" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/buyout", label: "Buyout Center", icon: "💰" },
  { href: "/legal", label: "Legal", icon: "⚖️" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <img
            src={openclawAvatar}
            alt="OpenClaw"
            className="w-7 h-7 rounded-full border border-cyan-dim/50 group-hover:border-primary transition-colors"
          />
          <span className="font-bold text-sm tracking-widest gradient-text uppercase">
            COLOSSAL
          </span>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                location.pathname === link.href
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-xs">{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
          <span className="hidden sm:inline">PRIME ACTIVE</span>
        </div>
      </div>
    </nav>
  );
}
