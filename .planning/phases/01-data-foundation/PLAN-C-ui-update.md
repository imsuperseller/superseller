---
wave: 3
depends_on: [PLAN-B-projects-api]
files_modified:
  - apps/web/superseller-site/src/components/admin/ProjectManagement.tsx
autonomous: true
requirements: [R1.5, R1.6]
---

# Plan C: UI Update — Live Stats + Type Badge

## Objective
Update `ProjectManagement.tsx` so:
1. The four stats cards (Active / Blocked / Completed / Upcoming) render the `stats` object returned by the real API instead of the hardcoded values `12 / 2 / 45 / 8`.
2. The project table shows the `type` badge (internal / customer / infrastructure / external) as a secondary label under the project name.
3. The `Project` TypeScript interface is extended to match the real DB model fields.

This plan is deliberately narrow — it only wires up what the API now provides. The full project-creation form and audit UI are deferred to Phase 6 (R2.5, R2.6).

## Tasks

<task id="1">
Open `/Users/shaifriedman/superseller/apps/web/superseller-site/src/components/admin/ProjectManagement.tsx`.

Replace the `Project` interface at the top of the file with the extended version that matches the real DB model:

```typescript
interface Project {
    id: string;
    name: string;
    description?: string;
    type: 'internal' | 'customer' | 'infrastructure' | 'external';
    status: 'planning' | 'in_progress' | 'verification' | 'completed' | 'blocked';
    progress: number;
    pillar?: string;
    owner?: string;
    githubRepo?: string;
    vercelProjectId?: string;
    startDate?: string;
    dueDate?: string;
    outlookEventId?: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectStats {
    active: number;
    blocked: number;
    completed: number;
    upcoming: number;
}
```
</task>

<task id="2">
Add a `stats` state variable and update the `fetchProjects` function to read `stats` from the API response.

Replace the existing state declarations:
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('');
```

With:
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [stats, setStats] = useState<ProjectStats>({ active: 0, blocked: 0, completed: 0, upcoming: 0 });
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('');
```

Then update the `fetchProjects` function body so it also reads stats:
```typescript
const response = await fetch('/api/admin/projects');
const data = await response.json();
if (data.success) {
    setProjects(data.projects);
    if (data.stats) setStats(data.stats);
}
```
</task>

<task id="3">
Replace the hardcoded stats array in the JSX. Find the block that reads:
```typescript
{[
    { label: 'Active', count: 12, color: 'text-cyan-400' },
    { label: 'Blocked', count: 2, color: 'text-red-500' },
    { label: 'Completed', count: 45, color: 'text-green-400' },
    { label: 'Upcoming', count: 8, color: 'text-purple-400' }
].map((stat) => (
```

Replace it with:
```typescript
{[
    { label: 'Active', count: stats.active, color: 'text-cyan-400' },
    { label: 'Blocked', count: stats.blocked, color: 'text-red-500' },
    { label: 'Completed', count: stats.completed, color: 'text-green-400' },
    { label: 'Upcoming', count: stats.upcoming, color: 'text-purple-400' }
].map((stat) => (
```
</task>

<task id="4">
Add a helper to map the `type` field to a display color, and render the type badge below the project name in the table.

After the existing `getStatusColor` function, add:
```typescript
const getTypeColor = (type: Project['type']) => {
    switch (type) {
        case 'customer':       return 'text-cyan-400';
        case 'infrastructure': return 'text-yellow-400';
        case 'external':       return 'text-purple-400';
        default:               return 'text-slate-500';
    }
};
```

In the table row where the project name and pillar are rendered:
```typescript
<div>
    <div className="flex items-center gap-2">
        <p className="text-sm font-black text-white uppercase tracking-tight">{project.name}</p>
        {project.outlookEventId && (
            <Calendar className="w-3 h-3 text-cyan-500" />
        )}
    </div>
    <p className="text-[10px] text-slate-500 font-medium">{project.pillar}</p>
</div>
```

Replace with:
```typescript
<div>
    <div className="flex items-center gap-2">
        <p className="text-sm font-black text-white uppercase tracking-tight">{project.name}</p>
        {project.outlookEventId && (
            <Calendar className="w-3 h-3 text-cyan-500" />
        )}
    </div>
    <div className="flex items-center gap-2 mt-0.5">
        {project.pillar && (
            <p className="text-[10px] text-slate-500 font-medium">{project.pillar}</p>
        )}
        <span className={`text-[9px] font-black uppercase tracking-widest ${getTypeColor(project.type)}`}>
            {project.type}
        </span>
    </div>
</div>
```
</task>

<task id="5">
The table currently uses `project.clientName` which no longer exists in the real Project model. The new model uses `owner` instead.

In the `Client / Pilot` column, replace:
```typescript
<div className="flex items-center space-x-2">
    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
        {project.clientName[0]}
    </div>
    <span className="text-sm text-slate-300 font-medium">{project.clientName}</span>
</div>
```

With:
```typescript
<div className="flex items-center space-x-2">
    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
        {(project.owner ?? '?')[0].toUpperCase()}
    </div>
    <span className="text-sm text-slate-300 font-medium">{project.owner ?? '—'}</span>
</div>
```
</task>

<task id="6">
The table currently uses `project.dueDate` which is a `DateTime` from Prisma (ISO string). Update the target date cell to format it cleanly:

Replace the target date cell:
```typescript
<td className="px-8 py-6 text-sm text-slate-400 font-mono">
    <div className="flex flex-col">
        <span>{project.dueDate}</span>
        {project.outlookEventId && (
            <span className="text-[8px] text-cyan-500/50 uppercase font-black tracking-tighter">Synced</span>
        )}
    </div>
</td>
```

With:
```typescript
<td className="px-8 py-6 text-sm text-slate-400 font-mono">
    <div className="flex flex-col">
        <span>
            {project.dueDate
                ? new Date(project.dueDate).toISOString().split('T')[0]
                : '—'}
        </span>
        {project.outlookEventId && (
            <span className="text-[8px] text-cyan-500/50 uppercase font-black tracking-tighter">Synced</span>
        )}
    </div>
</td>
```
</task>

## Verification
- [ ] TypeScript build passes with no errors: `cd apps/web/superseller-site && npx tsc --noEmit`
- [ ] In the browser, the 4 stat cards show values from the API (0s if no projects seeded yet — correct)
- [ ] Each project row shows the `type` label (internal / customer / etc.) in color-coded text below the pillar
- [ ] The `owner` column renders `—` gracefully when `owner` is null (no crash on `undefined[0]`)
- [ ] `dueDate` renders as `YYYY-MM-DD` or `—` — no raw ISO timestamp visible

## must_haves
- Zero hardcoded numbers in the stats cards — all values come from `data.stats`
- No TypeScript errors — `clientName` is fully removed from the interface and JSX
- Component renders an empty table (not a crash) when `projects` is `[]`
- Existing styling (dark theme, badge colors, progress bar) is unchanged
