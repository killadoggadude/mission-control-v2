"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  Cpu,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Briefcase,
  Layers,
  Rocket,
  TrendingUp,
  Camera,
  Code2,
  Users,
  MessageSquare,
  Wrench,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: string;
  name: string;
  job_title: string;
  model: string;
  status: "active" | "inactive" | "busy" | "error";
  last_seen: string | null;
  team_id: string;
  metadata: { schedule?: string } | null;
}

interface Team {
  id: string;
  name: string;
  agents: Agent[];
}

interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: any;
  teams: Team[];
}

const departmentConfig: Record<string, { icon: any; color: string; bg: string; gradient: string }> = {
  "Leadership": { 
    icon: Rocket, 
    color: "text-[#5347CE]", 
    bg: "bg-[#5347CE]/10",
    gradient: "from-[#5347CE] to-purple-600"
  },
  "Operations": { 
    icon: Wrench, 
    color: "text-blue-600", 
    bg: "bg-blue-50",
    gradient: "from-blue-500 to-cyan-500"
  },
  "Mira (AI OFM)": { 
    icon: Camera, 
    color: "text-pink-600", 
    bg: "bg-pink-50",
    gradient: "from-pink-500 to-rose-500"
  },
  "SaaS Development": { 
    icon: Code2, 
    color: "text-purple-600", 
    bg: "bg-purple-50",
    gradient: "from-purple-500 to-violet-500"
  },
  "Growth & Intel": { 
    icon: TrendingUp, 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    gradient: "from-emerald-500 to-teal-500"
  },
  "Build in Public": { 
    icon: MessageSquare, 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    gradient: "from-amber-500 to-orange-500"
  },
};

const statusColors = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-400",
  busy: "bg-amber-500",
  error: "bg-red-500",
};

const statusIcons = {
  active: CheckCircle2,
  inactive: Circle,
  busy: Zap,
  error: AlertCircle,
};

function getDepartmentName(teamName: string): string {
  if (teamName === "Operations") return "Operations";
  if (teamName.includes("Mira") || teamName === "Content") return "Mira (AI OFM)";
  if (teamName === "SaaS Development") return "SaaS Development";
  if (teamName.includes("Growth") || teamName.includes("Intel")) return "Growth & Intel";
  if (teamName.includes("Build") || teamName.includes("Public")) return "Build in Public";
  if (teamName === "Leadership") return "Leadership";
  return "Other";
}

export default function AgentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAgents();

    // Subscribe to real-time updates
    const channel: RealtimeChannel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
        },
        () => {
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAgents() {
    try {
      // Fetch teams with agents
      const { data: teamsData, error } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          agents (
            id,
            name,
            job_title,
            model,
            status,
            last_seen,
            team_id,
            metadata
          )
        `)
        .order("name");

      if (error) throw error;

      // Group teams by department
      const grouped: Record<string, Team[]> = {};
      
      teamsData?.forEach((team: any) => {
        const dept = getDepartmentName(team.name);
        if (!grouped[dept]) grouped[dept] = [];
        
        grouped[dept].push({
          id: team.id,
          name: team.name,
          agents: team.agents || [],
        });
      });

      // Transform to department objects with config
      const transformed = Object.entries(grouped).map(([deptName, teams]) => {
        const config = departmentConfig[deptName] || { 
          icon: Layers, 
          color: "text-zinc-600", 
          bg: "bg-zinc-50",
          gradient: "from-zinc-500 to-gray-500"
        };
        
        return {
          id: deptName.toLowerCase().replace(/\s+/g, '-'),
          name: deptName,
          description: getDepartmentDescription(deptName),
          color: config.color,
          bg: config.bg,
          icon: config.icon,
          gradient: config.gradient,
          teams,
        };
      });

      // Sort: Leadership first, then alphabetically
      transformed.sort((a, b) => {
        if (a.name === "Leadership") return -1;
        if (b.name === "Leadership") return 1;
        return a.name.localeCompare(b.name);
      });

      setDepartments(transformed);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }

  function getDepartmentDescription(name: string): string {
    const descriptions: Record<string, string> = {
      "Leadership": "Executive oversight and strategic coordination",
      "Operations": "Infrastructure, automation, and system maintenance",
      "Mira (AI OFM)": "AI creator business and content operations",
      "SaaS Development": "Product engineering and technical development",
      "Growth & Intel": "Marketing strategy, research, and analytics",
      "Build in Public": "Social media presence and community engagement",
    };
    return descriptions[name] || "Team";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5347CE]/20 border-t-[#5347CE] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#5347CE] to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent Swarm</h1>
            <p className="text-white/80 mt-1">
              {departments.reduce((sum, d) => sum + d.teams.reduce((s, t) => s + t.agents.length, 0), 0)} agents across {departments.length} departments
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm">
          Real-time view of all agents with live status updates from Supabase
        </p>
      </div>

      {/* Departments */}
      <div className="space-y-8">
        {departments.map((dept, deptIndex) => {
          const DeptIcon = dept.icon;
          const totalAgents = dept.teams.reduce((sum, t) => sum + t.agents.length, 0);
          
          return (
            <div key={dept.id} className="space-y-4">
              {/* Department Header */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${dept.bg}`}>
                  <DeptIcon className={`w-6 h-6 ${dept.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-900">
                      {dept.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.bg} ${dept.color}`}>
                      {totalAgents} {totalAgents === 1 ? 'agent' : 'agents'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {dept.description}
                  </p>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid gap-6">
                {dept.teams.map((team) => (
                  <div key={team.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    {/* Team Header */}
                    <div className={`px-5 py-3 border-b border-zinc-100 ${dept.bg}`}>
                      <div className="flex items-center gap-2">
                        <Briefcase className={`w-4 h-4 ${dept.color}`} />
                        <h3 className={`text-sm font-semibold ${dept.color}`}>
                          {team.name}
                        </h3>
                        <span className="text-xs text-zinc-400">
                          • {team.agents.length} {team.agents.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>

                    {/* Agents Grid */}
                    <div className="p-5">
                      {team.agents.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                          <p className="text-sm text-zinc-400">No agents in this team</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {team.agents.map((agent) => {
                            const StatusIcon = statusIcons[agent.status] || CheckCircle2;
                            const schedule = (agent.metadata as any)?.schedule;
                            
                            return (
                              <div
                                key={agent.id}
                                className="group relative bg-gradient-to-br from-white to-zinc-50 rounded-xl p-4 border border-zinc-200 hover:border-[#5347CE] hover:shadow-lg hover:shadow-[#5347CE]/10 transition-all duration-200"
                              >
                                {/* Active Pulse */}
                                {agent.status === "active" && (
                                  <div className="absolute -top-1 -right-1">
                                    <span className="flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                  </div>
                                )}

                                {/* Avatar */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg`}>
                                  {agent.name.charAt(0)}
                                </div>

                                {/* Agent Info */}
                                <div>
                                  <h4 className="font-bold text-zinc-900 text-base">
                                    {agent.name}
                                  </h4>
                                  <p className="text-sm text-zinc-500 mt-0.5">
                                    {agent.job_title}
                                  </p>
                                  
                                  {/* Model Badge */}
                                  <div className="flex items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600">
                                      <Cpu className="w-3 h-3" />
                                      {agent.model.includes("Local") ? "Local" : agent.model.split(" ")[0]}
                                    </span>
                                    {schedule && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600">
                                        <Clock className="w-3 h-3" />
                                        {schedule}
                                      </span>
                                    )}
                                  </div>

                                  {/* Status Bar */}
                                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                                    <StatusIcon className={`w-4 h-4 ${statusColors[agent.status].replace("bg-", "text-")}`} />
                                    <span className="text-xs font-medium text-zinc-500 capitalize">
                                      {agent.status}
                                    </span>
                                    {agent.last_seen && (
                                      <span className="text-xs text-zinc-400 ml-auto">
                                        {formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 border-4 border-zinc-200 border-t-[#5347CE] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-zinc-500 font-medium text-lg">No agents found</p>
          <p className="text-sm text-zinc-400 mt-2">
            Run <code className="px-2 py-1 bg-zinc-100 rounded text-zinc-600">npm run sync:agents</code> to import from SOUL.md
          </p>
        </div>
      )}
    </div>
  );
}
