-- Phase 3: CI Pipeline — CiRun table
-- Additive-only migration (safe with Drizzle worker tables)

CREATE TABLE IF NOT EXISTS "CiRun" (
    "id"          TEXT NOT NULL,
    "projectId"   TEXT,
    "repo"        TEXT NOT NULL,
    "branch"      TEXT NOT NULL DEFAULT 'main',
    "commitSha"   TEXT NOT NULL,
    "commitMsg"   TEXT,
    "status"      TEXT NOT NULL DEFAULT 'pending',
    "duration"    INTEGER,
    "typeCheck"   TEXT,
    "lint"        TEXT,
    "build"       TEXT,
    "testCount"   INTEGER,
    "failCount"   INTEGER,
    "errorLog"    TEXT,
    "workflowUrl" TEXT,
    "triggeredBy" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CiRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CiRun_repo_branch_idx" ON "CiRun"("repo", "branch");
CREATE INDEX IF NOT EXISTS "CiRun_projectId_idx" ON "CiRun"("projectId");
CREATE INDEX IF NOT EXISTS "CiRun_createdAt_idx" ON "CiRun"("createdAt");

-- FK to Project (optional)
DO $$ BEGIN
    ALTER TABLE "CiRun" ADD CONSTRAINT "CiRun_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
