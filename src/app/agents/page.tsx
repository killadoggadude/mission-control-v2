"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Briefcase,
  Layers,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: string;
  name: string;
  title: string;
  team: string;
  model: string;
  schedule: string;
  status: "active" | "paused" | "error";
  description: string;
}

interface Department {
  name: string;
  teams: Team[];
}

interface Team {
  name: string;
  agents: Agent[];
}

const statusColors = {
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  error: "bg-red-500",
};

const statusIcons = {
  active: CheckCircle2,
  paused: Circle,
  error: AlertCircle,
};

// Map teams to departments
function getDepartment(team: string): string {
  if (team === "Operations") return "Operations";
  if (team.includes("Mira") || team === "Content") return "Mira (AI OFM)";
  if (team === "SaaS Development") return "SaaS Development";
  if (team.includes("Growth") || team.includes("Intel")) return "Growth & Intel";
  if (team.includes("Build") || team.includes("Public")) return "Build in Public";
  if (team === "Leadership") return "Leadership";
  return "Other";
}

export default function AgentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      
      // Group agents by department → team
      const grouped: Record<string, Record<string, Agent[]>> = {};
      
      data.agents.forEach((agent: Agent) => {
        const dept = getDepartment(agent.team);
        const team = agent.team;
        
        if (!grouped[dept]) grouped[dept] = {};
        if (!grouped[dept][team]) grouped[dept][team] = [];
        
        grouped[dept][team].push(agent);
      });
      
      // Transform to array structure
      const transformed = Object.entries(grouped).map(([deptName, teams]) => ({
        name: deptName,
        teams: Object.entries(teams).map(([teamName, agents]) => ({
          name: teamName,
          agents,
        })),
      }));
      
      setDepartments(transformed);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Cpu className="w-12 h-12 text-[#5347CE] mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Agent Swarm</h1>
        <p className="text-zinc-500 mt-1">
          Live view of all agents from SOUL.md files
        </p>
      </div>

      {departments.map((dept) => (
        <div key={dept.name} className="space-y-4">
          {/* Department Header */}
          <div className="flex items-center gap-3 pb-3 border-b-2 border-[#5347CE]">
            <Layers className="w-6 h-6 text-[#5347CE]" />
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {dept.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {dept.teams.reduce((sum, t) => sum + t.agents.length, 0)} agents
              </p>
            </div>
          </div>

          {/* Teams */}
          <div className="grid gap-6">
            {dept.teams.map((team) => (
              <div key={team.name} className="bg-white rounded-xl border border-zinc-200 p-5">
                {/* Team Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
                      {team.name}
                    </h3>
                  </div>
                </div>

                {/* Agents Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {team.agents.map((agent) => {
                    const StatusIcon = statusIcons[agent.status];
                    return (
                      <div
                        key={agent.id}
                        className="group relative bg-zinc-50 rounded-lg p-4 border border-zinc-200 hover:border-[#5347CE] hover:shadow-md transition-all"
                      >
                        {/* Status Indicator */}
                        <div className="absolute top-3 right-3">
                          <StatusIcon
                            className={`w-4 h-4 ${statusColors[agent.status].replace("bg-", "text-")}`}
                          />
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5347CE] to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-3">
                          {agent.name.charAt(0)}
                        </div>

                        {/* Agent Info */}
                        <div>
                          <h4 className="font-semibold text-zinc-900">
                            {agent.name}
                          </h4>
                          <p className="text-sm text-zinc-500 mt-0.5">
                            {agent.title}
                          </p>
                          <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                            {agent.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-200">
                            <span className="text-xs text-zinc-400 font-mono">
                              {agent.model}
                            </span>
                            {agent.schedule && (
                              <div className="flex items-center gap-1 text-xs text-zinc-400">
                                <Clock className="w-3 h-3" />
                                {agent.schedule}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Active Status Badge */}
                        {agent.status === "active" && (
                          <div className="absolute -top-2 -left-2">
                            <span className="flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {departments.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">No agents found</p>
          <p className="text-sm text-zinc-400 mt-1">
            Make sure agents directory exists in workspace
          </p>
        </div>
      )}
    </div>
  );
}
