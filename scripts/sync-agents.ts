#!/usr/bin/env tsx
/**
 * Sync agents from SOUL.md files to Supabase
 * Run this whenever SOUL.md files change
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const workspacePath = process.env.OPENCLAW_WORKSPACE || '/Users/traudl/.openclaw/workspace';

const supabase = createClient(supabaseUrl, supabaseKey);

function parseSoulMd(content: string, agentId: string) {
  const extract = (pattern: RegExp) => {
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
  };

  return {
    id: agentId,
    name: extract(/\*\*Name:\*\*\s*(.+)/i) || agentId,
    job_title: extract(/\*\*Title:\*\*\s*(.+)/i) || 'Agent',
    team: extract(/\*\*Team:\*\*\s*(.+)/i) || 'General',
    model: extract(/\*\*Model:\*\*\s*(.+)/i) || 'unknown',
    schedule: extract(/\*\*Schedule:\*\*\s*(.+)/i) || 'Manual',
    status: 'active' as const,
    last_seen: new Date().toISOString(),
  };
}

async function syncAgents() {
  const agentsDir = join(workspacePath, 'agents');
  
  console.log('📂 Reading agents from:', agentsDir);
  
  const agentDirs = readdirSync(agentsDir).filter(dir => {
    const dirPath = join(agentsDir, dir);
    const files = readdirSync(dirPath);
    return files.includes('SOUL.md');
  });

  console.log(`✅ Found ${agentDirs.length} agents`);

  // Get team IDs
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name');
  
  const teamMap = new Map(teams?.map(t => [t.name, t.id]));

  // Sync each agent
  for (const dir of agentDirs) {
    const soulPath = join(agentsDir, dir, 'SOUL.md');
    const content = readFileSync(soulPath, 'utf-8');
    const agent = parseSoulMd(content, dir);

    const teamId = teamMap.get(agent.team);
    
    if (!teamId) {
      console.log(`⚠️  Skipping ${agent.name}: team "${agent.team}" not found`);
      continue;
    }

    // Upsert agent
    const { error } = await supabase
      .from('agents')
      .upsert({
        team_id: teamId,
        name: agent.name,
        job_title: agent.job_title,
        model: agent.model,
        status: agent.status,
        last_seen: agent.last_seen,
        metadata: {
          schedule: agent.schedule,
          source: 'SOUL.md',
        },
      }, {
        onConflict: 'name',
      });

    if (error) {
      console.error(`❌ Error syncing ${agent.name}:`, error.message);
    } else {
      console.log(`✅ Synced: ${agent.name} (${agent.model})`);
    }
  }

  console.log('\n🎉 Sync complete!');
}

syncAgents().catch(console.error);
