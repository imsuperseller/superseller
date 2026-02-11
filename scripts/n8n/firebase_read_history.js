// ============================================
// CODE NODE: Read Conversation History from Firebase
// ============================================
// Place this node AFTER "HTTP Request1" and BEFORE "Set1"
// This fetches the last 10 messages for conversation context
// ============================================

// Get phone number from the code node output
const phone = $('code').item.json.phone;

// Skip if no phone number
if (!phone) {
    return { json: { ...$json, conversationHistory: [], historyError: 'No phone number' } };
}

// Firestore REST API endpoint
const projectId = 'rensto';
const collectionPath = `whatsapp_conversations/${phone}/messages`;

try {
    // Query Firestore for messages, ordered by timestamp descending, limit 10
    const response = await $http.request({
        method: 'POST',
        url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            structuredQuery: {
                from: [{ collectionId: 'messages' }],
                orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
                limit: 10
            },
            parent: `projects/${projectId}/databases/(default)/documents/whatsapp_conversations/${phone}`
        })
    });

    // Parse the response
    const documents = response.body || response;

    // Convert Firestore documents to simple message format
    const messages = [];

    if (Array.isArray(documents)) {
        documents.forEach(item => {
            if (item.document && item.document.fields) {
                const fields = item.document.fields;
                messages.push({
                    role: fields.role?.stringValue || 'user',
                    content: fields.content?.stringValue || ''
                });
            }
        });
    }

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    // Format as chat history string for the AI agent
    const historyText = messages.map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    return {
        json: {
            ...$json,
            conversationHistory: messages,
            historyText: historyText,
            messageCount: messages.length
        }
    };

} catch (error) {
    // If Firestore fails, continue without history
    console.log('Firestore read error:', error.message);
    return {
        json: {
            ...$json,
            conversationHistory: [],
            historyText: '',
            historyError: error.message
        }
    };
}
