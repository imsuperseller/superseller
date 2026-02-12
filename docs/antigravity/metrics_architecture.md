# Rensto Success Metrics: Looker Studio Architecture

This document describes the data infrastructure for proving the ROI of each Pillar product via Looker Studio.

## PostgreSQL table: `metrics_snapshots`

We store metrics as daily "snapshots" to allow for historical trending in Looker Studio.

### Document Schema
```typescript
{
  id: string;             // ClientID_PillarID_MetricName_YYYYMMDD
  clientId: string;       // The client UID
  pillarId: string;       // lead_machine | voice_ai | knowledge_engine | content_engine
  timestamp: Timestamp;    // Snapshot date (midnight)
  metricName: string;      // e.g., 'leads_generated'
  metricValue: number;     // e.g., 42
  unit: string;            // e.g., 'leads'
  metadata: {             // Optional contextual data
    source: string;        // 'instantly' | 'telnyx' | 'rag_logs'
    trend: number;         // Percentage change from previous snapshot
  }
}
```

---

## Pillar-Specific Metrics

| Pillar | Metric Name | Source | logic |
| :--- | :--- | :--- | :--- |
| **Lead Machine** | `outreach_sent` | Instantly API | Total emails sent per client |
| | `leads_discovered` | Instantly API | Total positive responses |
| **Voice AI Agent** | `minutes_saved` | Telnyx CDL | Total call duration |
| | `calls_handled` | Telnyx CDL | Total incoming calls |
| **Knowledge Engine**| `queries_resolved` | Firestore Logs | Total RAG retrievals |
| | `accuracy_score` | LLM Eval | Average feedback rating |
| **Content Engine** | `posts_created` | n8n / Social APIs| Total published assets |

---

## n8n Workflow: `METRICS-COLLECTOR`

**Trigger**: Cron (Daily at 00:05 AM)

**Steps**:
1. **Fetch Users**: List all clients with active pillars.
2. **Fetch Source Data**:
   - Call Instantly API for each `lead_machine` client.
   - Call Telnyx API for `voice_ai` usage.
   - Count Firestore records for `knowledge_engine` activity.
3. **Calculate Snapshots**: Aggregate data for the previous 24 hours.
4. **Upsert to Firestore**: Save to `metrics_snapshots`.

---

## Looker Studio Connection

1. Use the **Google Firestore Community Connector**.
2. Point it to the `metrics_snapshots` collection.
3. Use the `timestamp` as the Dimension.
4. Use `metricValue` as the Metric.
5. Filter by `pillarId` to create pillar-specific dashboards.
