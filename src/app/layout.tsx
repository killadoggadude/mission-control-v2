"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Cpu,
  Video,
  MessageSquare,
  Image,
  Users,
  Twitter,
  TrendingUp,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "overview" },
  { href: "/agents", label: "Agent Swarm", icon: Cpu, section: "overview" },
  { href: "/jobs", label: "Jobs", icon: Rocket, section: "overview" },
  { href: "/video", label: "Video Studio", icon: Video, section: "glow-ofm" },
  { href: "/scripts", label: "Scripts", icon: MessageSquare, section: "glow-ofm" },
  { href: "/mira", label: "Image Prompts", icon: Image, section: "glow-ofm" },
  { href: "/creators", label: "Creators", icon: Users, section: "glow-ofm" },
  { href: "/tweets", label: "Tweets", icon: Twitter, section: "saas" },
  { href: "/analytics", label: "Analytics", icon: TrendingUp, section: "saas" },
];

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  "glow-ofm": "Glow OFM",
  saas: "SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const now = new Date();

  const grouped = navItems.reduce((acc, item) => {
    acc[item.section] = acc[item.section] || [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const currentLabel =
    pathname === "/"
      ? "Dashboard"
      : navItems.find((n) => n.href === pathname)?.label || "Page";

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-[#F9F9F9]">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col fixed h-screen z-20">
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5347CE] flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-semibold text-zinc-900">
                  Mission Control
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
              {Object.entries(grouped).map(([section, items]) => (
                <div key={section}>
                  <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 px-3">
                    {sectionLabels[section]}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#5347CE]/10 text-[#5347CE]"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-200">
              <p className="text-xs text-zinc-400">
                OpenClaw Mission Control v2
              </p>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col ml-64 min-w-0">
            {/* Header */}
            <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
              <span className="text-xl font-semibold text-zinc-900">
                {currentLabel}
              </span>
              <span className="text-sm text-zinc-400">
                {format(now, "EEEE, MMMM d, yyyy")}
              </span>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto px-8 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
