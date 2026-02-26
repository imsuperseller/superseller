// ============================================
// CODE NODE: Save Messages to Firebase
// ============================================
// Place this node AFTER "Gemini RAG Agent1" and BEFORE "Send a text message"
// This saves both user message and AI response to Firestore
// ============================================

// Get data from previous nodes
const phone = $('code').item.json.phone;
const userMessage = $('code').item.json.messageBody;
const aiResponse = $('Gemini RAG Agent1').item.json.output ||
    $('Gemini RAG Agent1').item.json.text ||
    "I'm sorry, I couldn't process that.";

// Skip if no phone number
if (!phone) {
    return { json: { ...$json, saveError: 'No phone number' } };
}

const projectId = 'superseller';
const now = new Date().toISOString();

// Helper function to create Firestore document
const createMessage = async (role, content) => {
    const docId = `${Date.now()}_${role}`;

    await $http.request({
        method: 'PATCH',
        url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/whatsapp_conversations/${phone}/messages/${docId}`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                role: { stringValue: role },
                content: { stringValue: content },
                timestamp: { timestampValue: now },
                phone: { stringValue: phone }
            }
        })
    });
};

try {
    // Save user message
    if (userMessage) {
        await createMessage('user', userMessage);
    }

    // Small delay to ensure ordering
    await new Promise(resolve => setTimeout(resolve, 50));

    // Save AI response
    if (aiResponse) {
        await createMessage('assistant', aiResponse);
    }

    // Also update the conversation metadata
    await $http.request({
        method: 'PATCH',
        url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/whatsapp_conversations/${phone}`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                phone: { stringValue: phone },
                lastUpdated: { timestampValue: now },
                lastMessage: { stringValue: userMessage?.substring(0, 100) || '' },
                messageCount: { integerValue: String(($json.messageCount || 0) + 2) }
            }
        })
    });

    return {
        json: {
            phone: phone,
            aiResponse: aiResponse,
            savedAt: now,
            saveSuccess: true
        }
    };

} catch (error) {
    console.log('Firestore save error:', error.message);
    // Don't block the message send if save fails
    return {
        json: {
            phone: phone,
            aiResponse: aiResponse,
            saveError: error.message,
            saveSuccess: false
        }
    };
}
