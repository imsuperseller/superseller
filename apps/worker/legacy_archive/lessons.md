# Lessons Learned

This file tracks mistakes, discoveries, and optimizations made by agents during development to avoid regressions and improve quality.

## CRITICAL: Verification Protocol
- **NEVER Assume Connectivity**: Just because a server is running (e.g., via `curl`) doesn't mean the frontend can reach it. Always verify from the *client's perspective* (browser logs, network tab).
- **Proactive End-to-End Testing**: Do not mark a task as "done" until you have verified the *entire flow* (e.g., API is up AND Frontend shows data).
- **"Ghost" Sessions**: When using mock auth, always verify the `userId` in the session matches the `userId` in the database records. Mismatches are silent failures.
- **Environment Parity**: Do not rely on "it works on my machine". If the user is on a different environment or network configuration, `localhost` refs in client code may fail. Prefer relative paths (`/api/...`) or strictly controlled ENV vars.

## Patterns to Avoid
- **"Blabbing" vs. Fixing**: Do not explain *why* something might work. Verify it *does* work, then report the result.
- **Partial Fixes**: Restarting a backend service is not a fix if the frontend still shows an error. Verify the *symptom* is gone.
- **Ignoring User Context**: If a user is frustrated, stop coding features. Audit the process and fix the workflow first.

## Known Gotchas
- **Pg-Boss Concurrency**: Default `teamConcurrency` is 1. Must be set higher for parallel processing.
- **Kie.ai Credits**: Failure to check credits leads to silent job failures.
- **Next.js Hydration**: Client-side data fetching in `useEffect` can be fragile if auth state is not stable. Always debug with explicit logs.

## Hallucinated / Mock Data Leaks
- **Blueprint vs. Reality**: Do not copy domains or paths from `blueprint.md` or `implementation specs.md` directly. These are often mocks (e.g., `realtor-video.com`). Always verify against the actual `.env` file and production environment.
- **Hardcoded Fallbacks**: Avoid adding hardcoded "placeholder" URLs in code (like `JobCard.tsx`). Use the R2 dev domain or relative paths as safe defaults.
- **SDD Rigor**: Failing to follow the "Spec -> Plan -> Tasks -> Implement" cycle leads to missing edge cases like document sanitization.
