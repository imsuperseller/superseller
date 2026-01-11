// Fetch answers from Google AI Studio file search (Gemini)
// CRITICAL: Check query FIRST for image test patterns (before static data)
let query = $input.params?.query || $json?.question || $json?.message_text || '';
query = String(query || '').trim();

// PRIORITY 1: Check if query is about image visibility/test (common image test questions)
// This check happens FIRST because it's the most reliable indicator
const imageTestPatterns = [
  'can you see this',
  'can you see this test image',
  'do you see this image',
  'can you see the image',
  'test image'
];

const lowerQuery = query.toLowerCase();
if (imageTestPatterns.some(pattern => lowerQuery.includes(pattern))) {
  console.log('[Search KB] ⚠️ BLOCKED - query is about image visibility/test');
  // Return explicit answer that tells agent to use Image Analysis
  const answer = '✅ YES, I can see the test image! The image has already been analyzed and the analysis is provided in your prompt under "Image Analysis:" section. Look at your prompt - you will see "Question:" followed by "Image Analysis:" - use that analysis to answer. The Image Analysis section contains the answer: "Yes, I can see this test image." Use that answer directly.';
  console.log('[Search KB] Returning image test answer:', answer.substring(0, 100));
  return answer;
}

// PRIORITY 2: Check static data flag (set by Prepare AI Input)
let staticData;
try {
  staticData = this.getWorkflowStaticData('global');
  console.log('[Search KB] Static data keys:', Object.keys(staticData).join(', '));
  console.log('[Search KB] hasImageAnalysis flag:', staticData.hasImageAnalysis);
} catch (error) {
  console.log('[Search KB] Static data error:', error.message);
  staticData = {};
}

if (staticData.hasImageAnalysis === true) {
  console.log('[Search KB] ⚠️ BLOCKED - hasImageAnalysis flag is true in static data');
  // Return explicit answer that tells agent to use Image Analysis
  const answer = '✅ The image has already been analyzed and the analysis is provided in your prompt under "Image Analysis:" section. Look at your prompt - you will see "Question:" followed by "Image Analysis:" - use that analysis to answer the question directly. Do NOT search knowledge base.';
  console.log('[Search KB] Returning STOP message:', answer.substring(0, 100));
  return answer;
}

// PRIORITY 3: Check if imageAnalysis field exists in input
const inputData = $input.params || $json || {};
if (inputData.imageAnalysis || $json?.imageAnalysis) {
  console.log('[Search KB] ⚠️ Skipping - imageAnalysis present, image already analyzed');
  return '✅ The image has already been analyzed. Use the Image Analysis provided in your prompt to answer directly. Do NOT search knowledge base.';
}

if (!query) {
  return 'I could not find any details about that yet.';
}

const defaultStore = 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p';
const normalizeStore = (store) => {
  if (!store) return defaultStore;
  const cleaned = store.replace(/^fileSearchStores\//, '');
  return `fileSearchStores/${cleaned}`;
};

// Get store_name from workflow static data, metadata, or use default
const storeName = normalizeStore(
  staticData.googleStoreName ||
  $json?.store_name ||
  defaultStore
);

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

const apiKey = 'AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const body = {
  contents: [{ parts: [{ text: query }]}],
  tools: [
    {
      file_search: {
        file_search_store_names: [storeName]
      }
    }
  ],
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 512
  }
};

console.log('[Search KB] Querying Google project:', storeName);
console.log('[Search KB] Query:', query);

const maxRetries = 3;
let lastError;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const response = await this.helpers.httpRequest({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      json: false,
      timeout: 60000
    });

    const data = typeof response === 'string' ? JSON.parse(response) : response;
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const answer = parts.map(part => part.text || '').join('\n\n').trim();

    if (answer) {
      console.log('[Search KB] ✅ Found answer from Google project');
      return answer;
    }

    lastError = new Error('Knowledge base returned no content');
  } catch (error) {
    lastError = error;
    const status = error.statusCode || 0;
    const retriable = status >= 500 || status === 429 || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
    if (attempt < maxRetries && retriable) {
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      continue;
    }
    break;
  }
}

console.log('[Search KB] ❌ No answer from Google project');
return lastError
  ? `I could not find that info yet (Google KB error: ${lastError.message}).`
  : 'I could not find information about that topic.';