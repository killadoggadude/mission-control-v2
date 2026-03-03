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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

interface Agent {
  id: string;
  name: string;
  job_title: string;
  description: string;
  avatar_url: string | null;
  model: string | null;
  status: "active" | "inactive" | "busy" | "error";
  last_seen: string | null;
  created_at: string;
}

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
      // Fetch departments with teams and agents
      const { data: depts, error } = await supabase
        .from("departments")
        .select(`
          *,
          teams (
            *,
            agents (
              id,
              name,
              job_title,
              description,
              avatar_url,
              model,
              status,
              last_seen,
              created_at
            )
          )
        `)
        .order("name");

      if (error) throw error;

      // Transform data into nested structure
      const transformed = depts.map((dept: any) => ({
        ...dept,
        teams: dept.teams.map((team: any) => ({
          ...team,
          agents: team.agents || [],
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
          Monitor and manage your AI agent workforce
        </p>
      </div>

      {departments.map((dept) => (
        <div key={dept.id} className="space-y-4">
          {/* Department Header */}
          <div
            className="flex items-center gap-3 pb-3 border-b-2"
            style={{ borderColor: dept.color }}
          >
            <Layers
              className="w-6 h-6"
              style={{ color: dept.color }}
            />
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {dept.name}
              </h2>
              {dept.description && (
                <p className="text-sm text-zinc-500">{dept.description}</p>
              )}
            </div>
          </div>

          {/* Teams */}
          <div className="grid gap-6">
            {dept.teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl border border-zinc-200 p-5">
                {/* Team Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
                      {team.name}
                    </h3>
                  </div>
                  {team.description && (
                    <p className="text-sm text-zinc-500 ml-6">
                      {team.description}
                    </p>
                  )}
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
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            agent.name.charAt(0)
                          )}
                        </div>

                        {/* Agent Info */}
                        <div>
                          <h4 className="font-semibold text-zinc-900">
                            {agent.name}
                          </h4>
                          {agent.job_title && (
                            <p className="text-sm text-zinc-500 mt-0.5">
                              {agent.job_title}
                            </p>
                          )}
                          {agent.description && (
                            <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                              {agent.description}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-200">
                            {agent.model && (
                              <span className="text-xs text-zinc-400 font-mono">
                                {agent.model.split("/")[1] || agent.model}
                              </span>
                            )}
                            {agent.last_seen && (
                              <div className="flex items-center gap-1 text-xs text-zinc-400">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(agent.last_seen), {
                                  addSuffix: true,
                                })}
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
            Run the schema.sql in Supabase to add sample data
          </p>
        </div>
      )}
    </div>
  );
}
