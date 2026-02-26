# SuperSeller AI Operations Tools

> [!NOTE]
> **Aitable.ai**: In use. These tools manage Aitable sync. Airtable.com and Firestore are retired.

This directory contains utility scripts for managing the SuperSeller AI AITable integration and Firestore data flows.

## 📋 Tool Reference

| Script | Purpose |
|--------|---------|
| `sync_leads_to_aitable.js` | **Main Sync**: Fetches unsynced leads from Firestore and pushes them to AITable. |
| `setup_aitable.js` | **Provisioning**: Connects to the SuperSeller AI Space and ensures the Leads datasheet exists. |
| `fix_datasheet_columns.js` | **Schema Maintenance**: Adds/Fixes missing columns in the AITable datasheet. |
| `list_aitable_resources.js` | **Discovery**: Lists all Spaces and Nodes available to your API token. |
| `inspect_datasheet.js` | **Diagnostics**: Lists the columns and metadata for a specific datasheet. |
| `simulate_lead.js` | **Testing**: Inserts a dummy lead into Firestore to test the end-to-end sync. |

## 🚀 Usage

### 1. Manual Sync
To manually trigger a sync of all new leads:
```bash
node tools/sync_leads_to_aitable.js
```

### 2. Verify Schema
If you add a new field to the Firestore `leads` collection, update the `columnsToAdd` array in `fix_datasheet_columns.js` and run:
```bash
node tools/fix_datasheet_columns.js
```

## 🛠 Prerequisites
- `.env.local` must contain `AITABLE_API_TOKEN`.
- `service-account.json` must be present in the parent directory for Firestore access.
