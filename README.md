# Mission Control v2

Real-time AI agent monitoring and management dashboard for OpenClaw.

## Features

- 🚀 **Real-time Updates** - Live agent status and job updates via Supabase subscriptions
- 🏢 **Hierarchy View** - Agents organized by department → team → individual
- 📊 **Dashboard** - Overview of all agents, active jobs, and completion stats
- 💼 **Agent Profiles** - Name, job title, description, model, status, last seen
- 🔔 **Live Status** - Active, inactive, busy, error states with visual indicators

## Quick Start

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for provisioning (~2 minutes)

### 2. Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy contents of `supabase/schema.sql`
3. Paste and run
4. This creates tables + sample data

### 3. Configure Environment

```bash
cd mission-control-v2
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get keys from: **Project Settings → API**

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/mission-control-v2.git
git push -u origin main

# Deploy to Vercel
npx vercel
```

Add environment variables in Vercel dashboard (same as `.env.local`).

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  OpenClaw    │────▶│   Supabase   │◀────│  Next.js UI  │
│  (agents)    │     │  (PostgreSQL)│     │   (Vercel)   │
│              │     │              │     │              │
│ Push events  │     │ - agents     │     │ Subscribes   │
│ Update jobs  │     │ - jobs       │     │ to changes   │
│ Log output   │     │ - logs       │     │ Live updates │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Database Schema

### Tables

- **departments** - Top-level org units (Executive, Content, Operations, Analytics)
- **teams** - Sub-units within departments (Command, Creative, Social, DevOps, Intelligence)
- **agents** - Individual AI agents with status, model, capabilities
- **jobs** - Task executions with status, output, timing
- **logs** - Detailed job logs with levels

### Real-time

All tables are enabled for Supabase Realtime. UI auto-updates on any change.

## Integration with OpenClaw

To push events from OpenClaw:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, serviceRoleKey)

// When agent starts
await supabase.from('agents').update({ status: 'active', last_seen: new Date() }).eq('name', 'Echo')

// When job starts
await supabase.from('jobs').insert({
  agent_id: agentId,
  task: 'Sync repositories',
  status: 'running',
  started_at: new Date()
})

// When job completes
await supabase.from('jobs').update({
  status: 'completed',
  completed_at: new Date(),
  duration_ms: 5432,
  output: 'Success'
}).eq('id', jobId)
```

## Pages

- `/` - Dashboard with stats and recent jobs
- `/agents` - Agent hierarchy (dept → team → agent)
- `/jobs` - All job history (coming soon)
- `/video` - Video studio (coming soon)
- `/scripts` - Script library (coming soon)
- `/mira` - Image prompts (coming soon)
- `/creators` - Creator profiles (coming soon)
- `/tweets` - Tweet management (coming soon)
- `/analytics` - Analytics dashboard (coming soon)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Icons:** Lucide React

## License

MIT
