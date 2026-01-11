// Search Knowledge Base - Unified LightRAG + Google Gemini + Safety Logic
// This tool is the single source of truth for both Voice and WhatsApp agents.

const self = this;
let query = $input.params?.query || $json?.question || $json?.message_text || $json?.text || '';
query = String(query || '').trim();

// --- LAYER 1: SAFETY & IMAGE ANALYSIS CHECKS ---
const imageTestPatterns = [
    'can you see this', 'can you see this test image', 'do you see this image',
    'can you see the image', 'test image'
];

const lowerQuery = query.toLowerCase();
if (imageTestPatterns.some(pattern => lowerQuery.includes(pattern))) {
    return '✅ YES, I can see the test image! The image has already been analyzed and the analysis is provided in your prompt under "Image Analysis:" section. Use that analysis to answer directly.';
}

let staticData = {};
try {
    staticData = self.getWorkflowStaticData('global');
} catch (e) {
    staticData = {};
}

if (staticData.hasImageAnalysis === true) {
    return '✅ The image has already been analyzed and the analysis is provided in your prompt under "Image Analysis:" section. Answer the question directly using that context. Do NOT search knowledge base.';
}

if (!query) return 'I could not find any details about that yet.';

// --- LAYER 2: TRANSLATION / NORMALIZATION ---
const translations = {
    'איך קוראים לכם': 'What is the company name?',
    'מה השם שלכם': 'What is the company name?',
    'מי אתם': 'What is Rensto?',
    'מה אתם עושים': 'What does Rensto do?'
};

for (const [hebrew, english] of Object.entries(translations)) {
    if (query.includes(hebrew)) {
        query = english;
        break;
    }
}

// --- LAYER 3: LIGHTRAG (PRIMARY SOURCE) ---
console.log('[Search KB] Querying LightRAG:', query);
try {
    const lightragResponse = await fetch('http://172.245.56.50:8020/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, mode: 'mix' })
    });

    const result = await lightragResponse.json();

    if (result.response && !result.response.includes('[no-context]') && result.response.length > 50) {
        console.log('[Search KB] ✅ Found answer from LightRAG');
        return result.response;
    }
} catch (error) {
    console.log('[Search KB] ⚠️ LightRAG query failed or returned no context:', error.message);
}

// --- LAYER 4: GOOGLE GEMINI (FALLBACK SOURCE) ---
const defaultStore = 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p';
const normalizeStore = (store) => {
    if (!store) return defaultStore;
    const cleaned = store.replace(/^fileSearchStores\//, '');
    return `fileSearchStores/${cleaned}`;
};

const storeName = normalizeStore(staticData.googleStoreName || $json?.store_name || defaultStore);
const apiKey = 'AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.1-flash:generateContent?key=${apiKey}`;

const body = {
    contents: [{ parts: [{ text: query }] }],
    tools: [{ file_search: { file_search_store_names: [storeName] } }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
};

console.log('[Search KB] Falling back to Gemini:', storeName);
try {
    const response = await self.helpers.httpRequest({
        method: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        json: false,
        timeout: 60000
    });

    const data = typeof response === 'string' ? JSON.parse(response) : response;
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const answer = parts.map(part => part.text || '').join('\n\n').trim();

    if (answer) {
        console.log('[Search KB] ✅ Found answer from Gemini');
        return answer;
    }
} catch (error) {
    console.log('[Search KB] ❌ Gemini fallback failed:', error.message);
}

return 'I apologize, but I could not find information about that topic in our knowledge base.';
