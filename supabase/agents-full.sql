-- Mission Control v2 - Full 20 Agent Roster
-- Run this in Supabase SQL Editor to add all agents

-- First, clear existing sample data
DELETE FROM agents;
DELETE FROM teams;
DELETE FROM departments;

-- Create Departments
INSERT INTO departments (id, name, description, color) VALUES
  ('5347ce01-0000-0000-0000-000000000001', 'Operations', 'Core infrastructure and automation', '#3B82F6'),
  ('5347ce01-0000-0000-0000-000000000002', 'Mira (AI OFM)', 'AI creator business and content', '#EC4899'),
  ('5347ce01-0000-0000-0000-000000000003', 'SaaS Development', 'Product development and engineering', '#8B5CF6'),
  ('5347ce01-0000-0000-0000-000000000004', 'Growth & Intel', 'Marketing, research, and analytics', '#10B981'),
  ('5347ce01-0000-0000-0000-000000000005', 'Build in Public', 'Social presence and community', '#F59E0B'),
  ('5347ce01-0000-0000-0000-000000000006', 'Leadership', 'Executive oversight', '#5347CE');

-- Create Teams
INSERT INTO teams (id, department_id, name, description) VALUES
  ('5347ce02-0000-0000-0000-000000000001', '5347ce01-0000-0000-0000-000000000001', 'Operations', 'Infrastructure and system maintenance'),
  ('5347ce02-0000-0000-0000-000000000002', '5347ce01-0000-0000-0000-000000000002', 'Mira (AI OFM)', 'Creator business operations'),
  ('5347ce02-0000-0000-0000-000000000003', '5347ce01-0000-0000-0000-000000000003', 'SaaS Development', 'Product engineering'),
  ('5347ce02-0000-0000-0000-000000000004', '5347ce01-0000-0000-0000-000000000004', 'Growth & Intel', 'Growth strategy and intelligence'),
  ('5347ce02-0000-0000-0000-000000000005', '5347ce01-0000-0000-0000-000000000005', 'Build in Public', 'Social media and community'),
  ('5347ce02-0000-0000-0000-000000000006', '5347ce01-0000-0000-0000-000000000006', 'Leadership', 'Executive oversight');

-- Create All 20 Agents
INSERT INTO agents (team_id, name, job_title, description, model, status, last_seen) VALUES

-- Operations (5 agents)
('5347ce02-0000-0000-0000-000000000001', 'Blaze', 'Backup Manager', 'Manages hourly backups and data integrity. Ensures all critical data is backed up with checksum verification.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000001', 'Cosmo', 'Cost Analyst', 'Tracks API spend across all agents. Generates cost reports and optimizes spending. Monitors budget vs actual.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000001', 'Echo', 'Git Sync Operator', 'Manages git workflows, syncs repositories, handles deployments. Keeps all codebases in sync.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000001', 'Iris', 'Memory Keeper', 'Maintains MEMORY.md and daily notes. Synthesizes learnings and curates long-term memory.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000001', 'Vega', 'Browser Watchdog', 'Monitors browser health, CDP status, and automation readiness. Health checks every 5 minutes.', 'qwen3.5-9b-local', 'active', NOW()),

-- Mira (AI OFM) (5 agents)
('5347ce02-0000-0000-0000-000000000002', 'Cleo', 'Chat Intelligence', 'Analyzes Fanvue chats and subscriber behavior. Extracts insights from conversations.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000002', 'Jax', 'Social Automation', 'Automates social media posting and engagement. Manages posting schedules.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000002', 'Luna', 'Prompt Artist', 'Creates and refines image prompts for Mira. Specializes in iPhone photography aesthetics.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000002', 'Maya', 'Content Strategist', 'Develops content strategy for Mira. Plans video scripts and content calendars.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000002', 'Rex', 'Revenue Tracker', 'Tracks revenue and financial metrics for Mira business. Monitors subscriptions and earnings.', 'qwen3.5-9b-local', 'active', NOW()),

-- SaaS Development (3 agents)
('5347ce02-0000-0000-0000-000000000003', 'Nova', 'Lead Developer', 'Code reviews, security audits, and technical oversight. Ensures code quality.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000003', 'Orion', 'SaaS Scout', 'Discovers new SaaS opportunities and market trends. Researches competitors.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000003', 'Sage', 'Project Monitor', 'Monitors project health and progress. Tracks milestones and deliverables.', 'qwen3.5-9b-local', 'active', NOW()),

-- Growth & Intel (3 agents)
('5347ce02-0000-0000-0000-000000000004', 'Kai', 'TikTok Strategist', 'Develops TikTok content strategy and growth tactics. Analyzes trending content.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000004', 'Phoenix', 'Growth Strategist', 'Plans growth initiatives and marketing campaigns. Optimizes conversion funnels.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000004', 'Ryder', 'Cross-Project Analyst', 'Analyzes patterns across projects. Identifies synergies and opportunities.', 'qwen3.5-9b-local', 'active', NOW()),

-- Build in Public (3 agents)
('5347ce02-0000-0000-0000-000000000005', 'Atlas', 'X Researcher', 'Researches trends on X/Twitter. Identifies viral content and engagement opportunities.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000005', 'Jaxon', 'Lead Tweet Writer', 'Writes and schedules tweets for build-in-public content. Engages with community.', 'qwen3.5-9b-local', 'active', NOW()),
('5347ce02-0000-0000-0000-000000000005', 'Zara', 'Growth Tweet Writer', 'Creates growth-focused tweet content. Specializes in viral hooks and threads.', 'qwen3.5-9b-local', 'active', NOW()),

-- Leadership (1 agent)
('5347ce02-0000-0000-0000-000000000006', 'Traudl', 'Chief of Staff', 'Executive oversight and coordination. Manages agent swarm and strategic decisions.', 'claude-sonnet-4-6', 'active', NOW());

-- Verify
SELECT COUNT(*) as total_agents FROM agents;
SELECT d.name as department, COUNT(a.id) as agent_count 
FROM departments d 
LEFT JOIN teams t ON d.id = t.department_id 
LEFT JOIN agents a ON t.id = a.team_id 
GROUP BY d.name 
ORDER BY d.name;
