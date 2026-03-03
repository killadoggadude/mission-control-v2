-- Mission Control v2 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Departments table
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text default '#5347CE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Teams table (belongs to departments)
create table teams (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid references departments(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agents table
create table agents (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  job_title text,
  description text,
  avatar_url text,
  model text,
  status text default 'inactive' check (status in ('active', 'inactive', 'busy', 'error')),
  last_seen timestamptz,
  capabilities text[],
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs table
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade,
  task text not null,
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  output text,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Logs table
create table logs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  message text not null,
  level text default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_agents_team on agents(team_id);
create index idx_agents_status on agents(status);
create index idx_jobs_agent on jobs(agent_id);
create index idx_jobs_status on jobs(status);
create index idx_jobs_created on jobs(created_at desc);
create index idx_logs_job on logs(job_id);
create index idx_logs_created on logs(created_at desc);

-- Real-time: Enable replication for all tables
alter publication supabase_realtime add table agents;
alter publication supabase_realtime add table jobs;
alter publication supabase_realtime add table logs;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_departments_updated_at before update on departments
  for each row execute function update_updated_at_column();

create trigger update_teams_updated_at before update on teams
  for each row execute function update_updated_at_column();

create trigger update_agents_updated_at before update on agents
  for each row execute function update_updated_at_column();

-- Sample data (optional - delete in production)
insert into departments (name, description, color) values
  ('Executive', 'Leadership and coordination', '#5347CE'),
  ('Content', 'Content creation and management', '#EC4899'),
  ('Operations', 'Automation and infrastructure', '#10B981'),
  ('Analytics', 'Data and insights', '#F59E0B');

insert into teams (department_id, name, description) values
  ((select id from departments where name = 'Executive'), 'Command', 'Central command and coordination'),
  ((select id from departments where name = 'Content'), 'Creative', 'Video, image, and copy generation'),
  ((select id from departments where name = 'Content'), 'Social', 'Social media management'),
  ((select id from departments where name = 'Operations'), 'DevOps', 'Infrastructure and deployments'),
  ((select id from departments where name = 'Analytics'), 'Intelligence', 'Data analysis and reporting');

insert into agents (team_id, name, job_title, description, status, model) values
  ((select id from teams where name = 'Command'), 'Echo', 'Git Operations Manager', 'Manages all Git repositories, syncs code, handles deployments', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Command'), 'Vega', 'Browser Operations', 'Controls browser automation, health monitoring, web interactions', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Creative'), 'Maya', 'Video Producer', 'Creates talking head videos, dance videos, manages video pipeline', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Creative'), 'Mira', 'Image Generation', 'Generates images with Higgsfield, manages prompt library', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Creative'), 'Nova', 'Script Writer', 'Writes scripts for videos, manages script library', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Social'), 'Blaze', 'Social Media Manager', 'Posts to Twitter/X, manages social presence', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'DevOps'), 'Cosmo', 'Cost Analyst', 'Tracks API costs, monitors spending, generates reports', 'active', 'qwen35/qwen3.5-plus'),
  ((select id from teams where name = 'Intelligence'), 'Cleo', 'Chat Intelligence', 'Analyzes chats, extracts insights, manages conversations', 'active', 'qwen35/qwen3.5-plus');
