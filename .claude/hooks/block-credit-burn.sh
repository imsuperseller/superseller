#!/bin/bash
# block-credit-burn.sh — PreToolUse hook for Bash tool
# Blocks commands that would consume Kie.ai credits without explicit user approval.
# Exit 0 = allow, Exit 2 = block (stderr becomes Claude's feedback).

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Nothing to check if command is empty
[ -z "$COMMAND" ] && exit 0

# --- Pattern 1: Creating video pipeline jobs on VPS ---
# Matches: ssh ... curl ... /api/jobs  (any job creation on the worker)
if echo "$COMMAND" | grep -qiE 'ssh.*172\.245\.56\.50.*curl.*/api/jobs'; then
  echo "BLOCKED: Creating a video job on RackNerd burns ~\$1.72 in Kie.ai credits per job." >&2
  echo "Ask the user for explicit approval before creating test jobs." >&2
  exit 2
fi

# --- Pattern 2: Creating jobs via direct curl to worker ---
# Matches: curl ... 172.245.56.50 ... /api/jobs
if echo "$COMMAND" | grep -qiE 'curl.*172\.245\.56\.50.*/api/jobs'; then
  echo "BLOCKED: Creating a video job on RackNerd burns ~\$1.72 in Kie.ai credits per job." >&2
  echo "Ask the user for explicit approval before creating test jobs." >&2
  exit 2
fi

# --- Pattern 3: Direct Kie.ai API calls ---
# Matches: curl ... api.kie.ai
if echo "$COMMAND" | grep -qiE 'curl.*api\.kie\.ai'; then
  echo "BLOCKED: Direct Kie.ai API calls consume credits." >&2
  echo "Ask the user for explicit approval before calling Kie.ai directly." >&2
  exit 2
fi

# --- Pattern 4: Running job-creation scripts ---
# Matches: node ... create-.*-job  or  tsx ... create-.*-job
if echo "$COMMAND" | grep -qiE '(node|tsx|npx).*create-.*-job'; then
  echo "BLOCKED: Job creation scripts consume Kie.ai credits." >&2
  echo "Ask the user for explicit approval before running job creation scripts." >&2
  exit 2
fi

# --- Pattern 5: SSH commands that POST to /api/jobs ---
# Matches: ssh ... POST ... /api/jobs
if echo "$COMMAND" | grep -qiE 'ssh.*POST.*/api/jobs'; then
  echo "BLOCKED: POSTing to /api/jobs creates video jobs that burn Kie.ai credits (~\$1.72/job)." >&2
  echo "Ask the user for explicit approval." >&2
  exit 2
fi

# No match — allow
exit 0
