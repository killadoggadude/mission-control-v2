import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface Agent {
  id: string;
  name: string;
  title: string;
  team: string;
  model: string;
  schedule: string;
  status: 'active' | 'paused' | 'error';
  description: string;
  avatar?: string;
}

function parseSoulMd(content: string): Partial<Agent> {
  const result: Partial<Agent> = {};
  
  const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/i);
  if (nameMatch) result.name = nameMatch[1].trim();
  
  const titleMatch = content.match(/\*\*Title:\*\*\s*(.+)/i);
  if (titleMatch) result.title = titleMatch[1].trim();
  
  const teamMatch = content.match(/\*\*Team:\*\*\s*(.+)/i);
  if (teamMatch) result.team = teamMatch[1].trim();
  
  const modelMatch = content.match(/\*\*Model:\*\*\s*(.+)/i);
  if (modelMatch) result.model = modelMatch[1].trim();
  
  const scheduleMatch = content.match(/\*\*Schedule:\*\*\s*(.+)/i);
  if (scheduleMatch) result.schedule = scheduleMatch[1].trim();
  
  return result;
}

export async function GET() {
  try {
    // Path to OpenClaw workspace agents directory
    const workspacePath = process.env.OPENCLAW_WORKSPACE || '/Users/traudl/.openclaw/workspace';
    const agentsDir = join(workspacePath, 'agents');
    
    if (!existsSync(agentsDir)) {
      return NextResponse.json({ error: 'Agents directory not found', agents: [] }, { status: 404 });
    }
    
    // Read all agent directories
    const agentDirs = readdirSync(agentsDir).filter(dir => {
      const dirPath = join(agentsDir, dir);
      const stat = readdirSync(dirPath);
      return stat.includes('SOUL.md');
    });
    
    const agents: Agent[] = agentDirs.map(dir => {
      const soulPath = join(agentsDir, dir, 'SOUL.md');
      const content = readFileSync(soulPath, 'utf-8');
      const soulData = parseSoulMd(content);
      
      return {
        id: dir,
        name: soulData.name || dir,
        title: soulData.title || 'Agent',
        team: soulData.team || 'General',
        model: soulData.model || 'unknown',
        schedule: soulData.schedule || 'Manual',
        status: 'active' as const,
        description: `${soulData.name || dir} - ${soulData.title || 'Agent'}`,
      } as Agent;
    });
    
    return NextResponse.json({ agents, total: agents.length });
  } catch (e) {
    console.error('Failed to load agents:', e);
    return NextResponse.json({ error: 'Failed to load agents', agents: [] }, { status: 500 });
  }
}
