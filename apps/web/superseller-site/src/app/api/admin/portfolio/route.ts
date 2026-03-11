// GET /api/admin/portfolio — Multi-project portfolio: GitHub commits + Vercel deploys
// Aggregates data across SuperSeller, Rensto, Iron Dome, Yoram repos

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

interface RepoConfig {
  owner: string;
  repo: string;
  label: string;
  vercelProjectId?: string;
  vercelTeamId?: string;
  // Per-repo token overrides (env var names) — falls back to GITHUB_TOKEN / VERCEL_TOKEN
  githubTokenEnv?: string;
  vercelTokenEnv?: string;
}

// All repos across the empire
const REPOS: RepoConfig[] = [
  {
    owner: 'imsuperseller',
    repo: 'superseller',
    label: 'SuperSeller AI',
    vercelProjectId: 'prj_AKC4gUSm2EWNj3RR8Cou4cILHYxp',
    vercelTeamId: 'team_a1gxSHNFg8Pp7qxoUN69QkVl',
  },
  {
    owner: 'renstollc',
    repo: 'rensto-app',
    label: 'Rensto',
    vercelProjectId: 'prj_ab8ufSPmwGeqQM7yrPtsrOsLXLqZ',
    vercelTeamId: 'team_a1gxSHNFg8Pp7qxoUN69QkVl',
  },
  {
    owner: '1shaifriedman-create',
    repo: 'iron-dome-os',
    label: 'Iron Dome OS',
    vercelProjectId: 'prj_tlujq3pl5D0H4PwWNXefOZur52zi',
    githubTokenEnv: 'GITHUB_TOKEN_PERSONAL',
    vercelTokenEnv: 'VERCEL_TOKEN_PERSONAL',
  },
  {
    owner: 'yoramnfridman1',
    repo: 'yoram-landing',
    label: 'Yoram Friedman',
    vercelProjectId: 'prj_5qSPLWMnNWoSEYnc7VXcOz89E6CA',
    githubTokenEnv: 'GITHUB_TOKEN_YORAM',
    vercelTokenEnv: 'VERCEL_TOKEN_YORAM',
  },
];

async function fetchGitHubCommits(owner: string, repo: string, token: string) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return { commits: [], error: `GitHub ${res.status}` };
    const data = await res.json();
    return {
      commits: data.map((c: any) => ({
        sha: c.sha?.slice(0, 7),
        message: c.commit?.message?.split('\n')[0]?.slice(0, 80),
        author: c.commit?.author?.name,
        date: c.commit?.author?.date,
        url: c.html_url,
      })),
    };
  } catch {
    return { commits: [], error: 'GitHub timeout' };
  }
}

async function fetchGitHubRepoInfo(owner: string, repo: string, token: string) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      stars: data.stargazers_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      pushedAt: data.pushed_at,
      language: data.language,
      private: data.private,
    };
  } catch {
    return null;
  }
}

async function fetchVercelDeploys(projectId: string, token: string, teamId?: string) {
  try {
    const teamParam = teamId ? `&teamId=${teamId}` : '';
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=3${teamParam}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return { deploys: [], error: `Vercel ${res.status}` };
    const data = await res.json();
    return {
      deploys: (data.deployments || []).map((d: any) => ({
        id: d.uid,
        state: d.readyState || d.state, // READY, ERROR, BUILDING, QUEUED
        url: d.url ? `https://${d.url}` : null,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
        source: d.meta?.githubCommitMessage?.split('\n')[0]?.slice(0, 80) || d.name,
        commitSha: d.meta?.githubCommitSha?.slice(0, 7),
      })),
    };
  } catch {
    return { deploys: [], error: 'Vercel timeout' };
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.isValid || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const defaultGithubToken = process.env.GITHUB_TOKEN;
    const defaultVercelToken = process.env.VERCEL_TOKEN;

    if (!defaultGithubToken) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Fetch all repos in parallel — each repo can use its own token
    const results = await Promise.all(
      REPOS.map(async (repo) => {
        const ghToken = (repo.githubTokenEnv && process.env[repo.githubTokenEnv]) || defaultGithubToken;
        const vcToken = (repo.vercelTokenEnv && process.env[repo.vercelTokenEnv]) || defaultVercelToken;

        const [commitsResult, repoInfo, deploysResult] = await Promise.all([
          fetchGitHubCommits(repo.owner, repo.repo, ghToken),
          fetchGitHubRepoInfo(repo.owner, repo.repo, ghToken),
          repo.vercelProjectId && vcToken
            ? fetchVercelDeploys(repo.vercelProjectId, vcToken, repo.vercelTeamId)
            : Promise.resolve({ deploys: [] }),
        ]);

        return {
          label: repo.label,
          owner: repo.owner,
          repo: repo.repo,
          repoUrl: `https://github.com/${repo.owner}/${repo.repo}`,
          info: repoInfo,
          commits: commitsResult.commits,
          commitError: commitsResult.error,
          deploys: deploysResult.deploys,
          deployError: 'error' in deploysResult ? deploysResult.error : undefined,
          latestDeploy: deploysResult.deploys[0] || null,
        };
      })
    );

    // Summary stats
    const totalCommitsToday = results.reduce((sum, r) => {
      const today = new Date().toISOString().slice(0, 10);
      return sum + r.commits.filter((c: any) => c.date?.startsWith(today)).length;
    }, 0);

    const deployErrors = results.filter(
      (r) => r.latestDeploy?.state === 'ERROR'
    ).length;

    return NextResponse.json({
      success: true,
      projects: results,
      summary: {
        totalProjects: results.length,
        commitsToday: totalCommitsToday,
        deployErrors,
        allHealthy: deployErrors === 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
