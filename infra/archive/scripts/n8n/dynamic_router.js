// Code Node: Match Client to Webhook
// Place this node AFTER the Firestore "Get All Configs" node

const allConfigs = $items('Firestore Get All'); // Ensure your previous node is named 'Firestore Get All'
const incomingSource = $node['Webhook'].json.body;
// OR if using WAHA directly:
// const sessionName = incomingSource.session;

// 1. Get the ID we are looking for (The one pasted in the Dashboard)
// For this verifying launch, we assume the user pasted the n8n Webhook ID or Session Name
// For testing, we might just match the 'shai' client directly if found.

const incomingId = '556f1aab-220c-4281-90b8-0570465d50b1'; // Example: In real usage, extract this from the webhook URL or body

// 2. Find the config that matches
const match = allConfigs.find(item => {
  const config = item.json;
  return config.n8nWebhookId === incomingId || config.clientId === 'shai'; // Fallback for dev
});

if (match) {
  return {
    json: {
      found: true,
      clientId: match.json.clientId,
      agentName: match.json.agentName || 'SuperSeller AI Secretary', // Default
      ...match.json
    }
  };
} else {
  return {
    json: {
      found: false,
      error: 'No matching client config found for this ID'
    }
  };
}
