# n8n workflow scripts

Canonical scripts for deploying and validating n8n workflows. One-off and variant scripts are in `archive/`.

## Canonical scripts (use these)

| Script | Purpose |
|--------|--------|
| **push_workflow.py** | Push a workflow JSON file to the n8n instance. Usage: `python push_workflow.py <workflow.json> [workflow_id]` |
| **validate_workflow_json.py** | Validate a workflow JSON file (syntax + optional duplicate node names/IDs). Usage: `python validate_workflow_json.py <workflow.json>` |

### Environment (optional)

- `N8N_API_KEY` – n8n API key (required for push unless script has fallback).
- `N8N_URL` – Base URL (e.g. `http://172.245.56.50:5678/api/v1`). Defaults in script if unset.

## Archive

The `archive/` folder contains one-off and variant scripts (deploy_workflow_*.py, fix_workflow*.py, repair scripts, etc.) moved from repo root and from `infra/`. Kept for reference only; use the canonical scripts above for new work.
