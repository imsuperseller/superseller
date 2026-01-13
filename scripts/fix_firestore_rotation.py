import json

def fix_firestore_and_rotation(filepath):
    with open(filepath, 'r') as f:
        wf = json.load(f)

    for node in wf['nodes']:
        # 1. Fix Firestore Database IDs
        if "googleFirebaseCloudFirestore" in node['type']:
            # Force database to (default) for all nodes 
            # (including parameters of tools)
            if 'parameters' in node:
                node['parameters']['database'] = "(default)"
                # Ensure projectId is also explicitly set to 'rensto' if it's currently an expression
                node['parameters']['projectId'] = "rensto"

        # 2. Fix Topic Rotation Logic
        if node['name'] == "Topic Rotation":
            node['parameters']['jsCode'] = """// Rensto Content Engine - English Topic Rotation
const topics = [
  "Leveraging AI RAG for Instant Employee Training",
  "Automating Outbound Lead Generation for SMBs",
  "The Future of Autonomous Voice Secretaries in Customer Service",
  "Building a Scalable AI Content Engine for SEO",
  "Maximizing ROI with AI-Driven Data Enrichment",
  "Reducing Churn with Predictive AI Analytics",
  "Integrating AI Agents into Existing Slack Workflows"
];

const topicRejectionData = $('Workflow Configuration').first().json;
const rejectionCount = topicRejectionData.rejectionCount || 0;
const timestamp = Date.now();

// FIX: Faster rotation (every hour) + rejection offset
const rotationSeed = Math.floor(timestamp / (1000 * 60 * 60)) + rejectionCount;

const selectedTopic = topics[rotationSeed % topics.length];

return [{
  json: {
    topic: selectedTopic,
    rejectionCount: rejectionCount,
    status: 'pending_approval',
    timestamp: new Date().toISOString()
  }
}];"""

    with open(filepath, 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    fix_firestore_and_rotation('/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json')
    print("Workflow fixed: Firestore database set to (default) and Topic Rotation seed updated to hourly.")
