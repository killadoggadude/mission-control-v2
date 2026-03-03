"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  totalAgents: number;
  activeAgents: number;
  runningJobs: number;
  completedToday: number;
}

interface RecentJob {
  id: string;
  agent_name: string;
  task: string;
  status: string;
  duration_ms: number | null;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      // Fetch stats
      const { data: agents } = await supabase
        .from("agents")
        .select("status", { count: "exact" });

      const { data: jobs } = await supabase
        .from("jobs")
        .select("status, created_at")
        .gte("created_at", new Date().toISOString().split("T")[0]);

      const { data: recentJobsData } = await supabase
        .from("jobs")
        .select(`
          id,
          task,
          status,
          duration_ms,
          created_at,
          agents (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      const totalAgents = agents?.length || 0;
      const activeAgents = agents?.filter((a) => a.status === "active").length || 0;
      const runningJobs = jobs?.filter((j) => j.status === "running").length || 0;
      const completedToday = jobs?.filter((j) => j.status === "completed").length || 0;

      setStats({
        totalAgents,
        activeAgents,
        runningJobs,
        completedToday,
      });

      setRecentJobs(
        recentJobsData?.map((j: any) => ({
          ...j,
          agent_name: j.agents?.name || "Unknown",
        })) || []
      );
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Agents",
      value: stats?.totalAgents ?? 0,
      icon: Cpu,
      color: "text-[#5347CE]",
      bg: "bg-[#5347CE]/10",
    },
    {
      label: "Active Now",
      value: stats?.activeAgents ?? 0,
      icon: Zap,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Running Jobs",
      value: stats?.runningJobs ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Completed Today",
      value: stats?.completedToday ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Cpu className="w-12 h-12 text-[#5347CE] mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">
          Real-time overview of your agent operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-zinc-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-5 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Jobs</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No jobs yet. Jobs will appear here when agents start working.
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === "completed" ? "bg-emerald-500" :
                    job.status === "running" ? "bg-amber-500" :
                    job.status === "failed" ? "bg-red-500" :
                    "bg-zinc-400"
                  }`} />
                  <div>
                    <p className="font-medium text-zinc-900">{job.task}</p>
                    <p className="text-sm text-zinc-500">
                      {job.agent_name} • {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.duration_ms && (
                    <span className="text-sm text-zinc-400 font-mono">
                      {(job.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    job.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    job.status === "running" ? "bg-amber-100 text-amber-700" :
                    job.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-zinc-100 text-zinc-700"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
