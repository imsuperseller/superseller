// ULTIMATE BULLETPROOF Prepare AI Input - FIXED: Set hasImageAnalysis flag in static data
console.log('\n=== PREPARE AI INPUT - ULTIMATE DEBUG ===');

// Get ALL inputs
const allInputs = $input.all();
console.log('Total inputs received:', allInputs.length);

if (!allInputs || allInputs.length === 0) {
  throw new Error('No input data received! Check upstream nodes.');
}

// Get static data FIRST (most reliable source)
let staticData = {};
try {
  staticData = this.getWorkflowStaticData('global');
  console.log('Static data keys:', Object.keys(staticData).join(', '));
  if (staticData.lastMessageMetadata) {
    console.log('Static metadata userId:', staticData.lastMessageMetadata.userId);
  }
} catch (error) {
  console.log('Static data error:', error.message);
  staticData = {};
}

// AGGRESSIVE userId EXTRACTION - Try EVERY possible source
let userId = '';
let extractionMethod = '';

// PRIORITY 1: Static data (most reliable - set by Smart Message Router)
if (staticData.lastMessageMetadata && staticData.lastMessageMetadata.userId) {
  userId = String(staticData.lastMessageMetadata.userId);
  extractionMethod = 'static data (lastMessageMetadata)';
  console.log('✅ Found userId in static data:', userId);
}

// PRIORITY 2: Try upstream nodes using $node (if available)
if (!userId) {
  const upstreamNodeNames = ['Smart Message Router', 'Message Type Router', 'Process Media Context', 'Download Voice', 'Transcribe Voice'];
  for (let i = 0; i < upstreamNodeNames.length; i++) {
    const nodeName = upstreamNodeNames[i];
    try {
      const nodeData = $node[nodeName];
      if (nodeData && nodeData.json) {
        const nodeUserId = nodeData.json.userId || nodeData.json.from || nodeData.json.designer_phone || '';
        if (nodeUserId) {
          userId = String(nodeUserId);
          extractionMethod = '$node[' + nodeName + ']';
          console.log('✅ Found userId in upstream node', nodeName, ':', userId);
          break;
        }
        
        // Check nested payload
        if (!userId && nodeData.json.payload) {
          const payloadUserId = nodeData.json.payload.userId || nodeData.json.payload.from || '';
          if (payloadUserId) {
            userId = String(payloadUserId);
            extractionMethod = '$node[' + nodeName + '].payload';
            console.log('✅ Found userId in upstream node', nodeName, 'payload:', userId);
            break;
          }
        }
        
        // Check originalPayload
        if (!userId && nodeData.json.originalPayload) {
          const opUserId = nodeData.json.originalPayload.userId || nodeData.json.originalPayload.from || '';
          if (opUserId) {
            userId = String(opUserId);
            extractionMethod = '$node[' + nodeName + '].originalPayload';
            console.log('✅ Found userId in upstream node', nodeName, 'originalPayload:', userId);
            break;
          }
        }
      }
    } catch (error) {
      // Node might not exist or not accessible - continue
      console.log('Could not access node', nodeName, ':', error.message);
    }
  }
}

// PRIORITY 3: Check ALL input items
if (!userId) {
  for (let i = 0; i < allInputs.length; i++) {
    const item = allInputs[i];
    if (!item || !item.json) continue;
    
    const inputData = item.json;
    console.log(`Input ${i} keys:`, Object.keys(inputData).join(', '));
    
    // Direct fields
    const directFields = ['userId', 'from', 'designer_phone', 'chatId', 'sender', 'user'];
    for (let j = 0; j < directFields.length; j++) {
      const field = directFields[j];
      if (inputData[field]) {
        userId = String(inputData[field]);
        extractionMethod = `input ${i} direct field: ${field}`;
        console.log('✅ Found userId in input', i, 'field', field, ':', userId);
        break;
      }
    }
    
    if (userId) break;
    
    // Nested in payload
    if (inputData.payload) {
      const payload = inputData.payload;
      const payloadFields = ['userId', 'from', 'sender', 'chatId'];
      for (let j = 0; j < payloadFields.length; j++) {
        const field = payloadFields[j];
        if (payload[field]) {
          userId = String(payload[field]);
          extractionMethod = `input ${i} payload.${field}`;
          console.log('✅ Found userId in input', i, 'payload', field, ':', userId);
          break;
        }
      }
      
      // Check payload._data.key.remoteJid
      if (!userId && payload._data && payload._data.key) {
        const remoteJid = payload._data.key.remoteJid;
        if (remoteJid) {
          userId = String(remoteJid);
          extractionMethod = `input ${i} payload._data.key.remoteJid`;
          console.log('✅ Found userId in input', i, 'payload._data.key.remoteJid:', userId);
        }
      }
    }
    
    if (userId) break;
    
    // Nested in originalPayload
    if (inputData.originalPayload) {
      const op = inputData.originalPayload;
      const opFields = ['userId', 'from', 'sender', 'chatId'];
      for (let j = 0; j < opFields.length; j++) {
        const field = opFields[j];
        if (op[field]) {
          userId = String(op[field]);
          extractionMethod = `input ${i} originalPayload.${field}`;
          console.log('✅ Found userId in input', i, 'originalPayload', field, ':', userId);
          break;
        }
      }
      
      // Check originalPayload._data.key.remoteJid
      if (!userId && op._data && op._data.key) {
        const remoteJid = op._data.key.remoteJid;
        if (remoteJid) {
          userId = String(remoteJid);
          extractionMethod = `input ${i} originalPayload._data.key.remoteJid`;
          console.log('✅ Found userId in input', i, 'originalPayload._data.key.remoteJid:', userId);
        }
      }
    }
    
    if (userId) break;
    
    // Check _data at root level
    if (inputData._data && inputData._data.key) {
      const remoteJid = inputData._data.key.remoteJid;
      if (remoteJid) {
        userId = String(remoteJid);
        extractionMethod = `input ${i} _data.key.remoteJid`;
        console.log('✅ Found userId in input', i, '_data.key.remoteJid:', userId);
        break;
      }
    }
  }
}

// Clean up userId (remove @s.whatsapp.net if present, replace with @c.us)
if (userId) {
  userId = String(userId).replace('@s.whatsapp.net', '@c.us');
}

console.log('Final userId:', userId || 'NONE');
console.log('Extraction method:', extractionMethod || 'FAILED');

// AGGRESSIVE QUESTION EXTRACTION - FIXED: Prioritize Process Media Context
let question = '';
let questionMethod = '';
let imageAnalysis = null;

// FIRST: Try to get from Process Media Context node (upstream) - CRITICAL for images
let processMediaData = null;
try {
  processMediaData = $node['Process Media Context'];
  if (processMediaData && processMediaData.json) {
    console.log('✅ Found Process Media Context node');
    if (processMediaData.json.originalQuestion) {
      question = String(processMediaData.json.originalQuestion).trim();
      questionMethod = 'Process Media Context.originalQuestion';
      imageAnalysis = processMediaData.json.geminiAnalysis || processMediaData.json.imageAnalysis || null;
      console.log('✅ Found originalQuestion from Process Media Context:', question);
    } else if (processMediaData.json.originalCaption) {
      question = String(processMediaData.json.originalCaption).trim();
      questionMethod = 'Process Media Context.originalCaption';
      imageAnalysis = processMediaData.json.geminiAnalysis || processMediaData.json.imageAnalysis || null;
      console.log('✅ Found originalCaption from Process Media Context:', question);
    }
  }
} catch (error) {
  console.log('Could not access Process Media Context node:', error.message);
}

// SECOND: Check input items for originalQuestion/originalCaption (if Process Media Context not available)
if (!question) {
  for (let i = 0; i < allInputs.length; i++) {
    const item = allInputs[i];
    if (!item || !item.json) continue;
    
    const inputData = item.json;
    
    // CRITICAL: Check for originalQuestion first (from Process Media Context)
    if (inputData.originalQuestion) {
      const value = String(inputData.originalQuestion).trim();
      // Skip if it's clearly analysis text
      if (!value.includes('Visual Content Description') && !value.includes('OCR') && 
          !value.includes('תיאור תוכן חזותי') && !value.includes('טקסט מזוהה') &&
          !value.includes('Yes, I can see the test image you uploaded')) {
        question = value;
        questionMethod = `input ${i} originalQuestion`;
        imageAnalysis = inputData.geminiAnalysis || inputData.imageAnalysis || null;
        console.log('✅ Found originalQuestion:', question);
        break;
      }
    }
    
    // Check for originalCaption
    if (!question && inputData.originalCaption) {
      const value = String(inputData.originalCaption).trim();
      if (!value.includes('Visual Content Description') && !value.includes('OCR')) {
        question = value;
        questionMethod = `input ${i} originalCaption`;
        imageAnalysis = inputData.geminiAnalysis || inputData.imageAnalysis || null;
        console.log('✅ Found originalCaption:', question);
        break;
      }
    }
    
    // Store imageAnalysis if available
    if (!imageAnalysis && (inputData.geminiAnalysis || inputData.imageAnalysis)) {
      imageAnalysis = inputData.geminiAnalysis || inputData.imageAnalysis;
    }
  }
}

// THIRD: If no originalQuestion found, check standard fields (but skip analysis text)
if (!question) {
  const textFields = [
    'originalQuestion', 'originalCaption', 'question', 'text', 'processedText', 
    'textContent', 'body', 'message', 'content', 'transcript', 'transcription'
  ];
  
  for (let i = 0; i < allInputs.length; i++) {
    const item = allInputs[i];
    if (!item || !item.json) continue;
    
    const inputData = item.json;
    
    // Check direct fields
    for (let j = 0; j < textFields.length; j++) {
      const field = textFields[j];
      if (inputData[field]) {
        const value = String(inputData[field]).trim();
        // Skip if it's clearly image analysis text (contains analysis markers)
        if (value.includes('Visual Content Description') || value.includes('תיאור תוכן חזותי') ||
            value.includes('OCR') || value.includes('Extracted Text') || value.includes('טקסט מזוהה') ||
            value.includes('Yes, I can see the test image you uploaded') ||
            value.includes('Here\'s the analysis:')) {
          // This is analysis text, not the question - skip it
          console.log('⚠️ Skipping analysis text from field', field);
          continue;
        }
        question = value;
        questionMethod = `input ${i} direct field: ${field}`;
        console.log('✅ Found question in input', i, 'field', field);
        break;
      }
    }
    
    if (question) break;
    
    // Try nested payload
    if (inputData.payload && inputData.payload.body) {
      const value = String(inputData.payload.body).trim();
      if (!value.includes('Visual Content Description') && !value.includes('OCR') &&
          !value.includes('Yes, I can see the test image')) {
        question = value;
        questionMethod = `input ${i} payload.body`;
        console.log('✅ Found question in input', i, 'payload.body');
        break;
      }
    }
    
    // Try originalPayload
    if (inputData.originalPayload && inputData.originalPayload.body) {
      const value = String(inputData.originalPayload.body).trim();
      if (!value.includes('Visual Content Description') && !value.includes('OCR') &&
          !value.includes('Yes, I can see the test image')) {
        question = value;
        questionMethod = `input ${i} originalPayload.body`;
        console.log('✅ Found question in input', i, 'originalPayload.body');
        break;
      }
    }
  }
}

console.log('Final question:', question ? question.substring(0, 50) + '...' : 'NONE');
console.log('Question method:', questionMethod || 'FAILED');
console.log('Has image analysis:', !!imageAnalysis);

// Get other fields with fallbacks
const messageId = staticData.lastMessageMetadata && staticData.lastMessageMetadata.messageId 
  ? staticData.lastMessageMetadata.messageId 
  : (allInputs[0] && allInputs[0].json ? (allInputs[0].json.messageId || allInputs[0].json.id || '') : '');
const sessionId = userId || 'default';
const requiresVoiceResponse = staticData.lastMessageMetadata && staticData.lastMessageMetadata.requiresVoiceResponse 
  ? staticData.lastMessageMetadata.requiresVoiceResponse 
  : (allInputs[0] && allInputs[0].json ? (allInputs[0].json.requiresVoiceResponse || allInputs[0].json.messageType === 'voice' || false) : false);
const source = staticData.lastMessageMetadata && staticData.lastMessageMetadata.source 
  ? staticData.lastMessageMetadata.source 
  : (allInputs[0] && allInputs[0].json ? (allInputs[0].json.source || 'waha') : 'waha');
const store_name = staticData.lastMessageMetadata && staticData.lastMessageMetadata.store_name 
  ? staticData.lastMessageMetadata.store_name 
  : (allInputs[0] && allInputs[0].json ? (allInputs[0].json.store_name || 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p') : 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p');

// CRITICAL: Build promptText with imageAnalysis if available
let promptText = question;
const hasImageAnalysis = !!imageAnalysis;

if (imageAnalysis) {
  promptText = `Question: ${question}\n\nImage Analysis:\n${imageAnalysis}\n\nPlease answer the question based on the image analysis above.`;
  console.log('✅ Built promptText with imageAnalysis (length:', promptText.length, ')');
  
  // CRITICAL: Set flag in static data so Search Knowledge Base can check it
  staticData.hasImageAnalysis = true;
  staticData.imageAnalysisTimestamp = Date.now();
  try {
    this.setWorkflowStaticData('global', staticData);
    console.log('✅ Set hasImageAnalysis flag in static data');
  } catch (error) {
    console.log('⚠️ Could not set static data flag:', error.message);
  }
} else {
  console.log('✅ Built promptText without imageAnalysis');
  // Clear flag if no image analysis
  staticData.hasImageAnalysis = false;
  try {
    this.setWorkflowStaticData('global', staticData);
  } catch (error) {
    console.log('⚠️ Could not clear static data flag:', error.message);
  }
}

// Final validation
if (!question) {
  console.log('\n❌ NO QUESTION FOUND');
  console.log('Total inputs:', allInputs.length);
  for (let i = 0; i < allInputs.length; i++) {
    console.log(`Input ${i} keys:`, Object.keys(allInputs[i].json || {}).join(', '));
  }
  throw new Error('Missing question/text. Check execution log for input data.');
}

if (!userId) {
  console.log('\n❌ NO USERID FOUND AFTER ALL ATTEMPTS');
  console.log('Static data:', JSON.stringify(staticData, null, 2));
  console.log('Total inputs:', allInputs.length);
  for (let i = 0; i < allInputs.length; i++) {
    console.log(`Input ${i} full data:`, JSON.stringify(allInputs[i].json || {}, null, 2).substring(0, 500));
  }
  
  // LAST RESORT: Try to get from WAHA Trigger node
  try {
    const wahaNode = $node['WAHA Trigger'];
    if (wahaNode && wahaNode.json && wahaNode.json.payload) {
      const wahaPayload = wahaNode.json.payload;
      const wahaUserId = wahaPayload.from || (wahaPayload._data && wahaPayload._data.key && wahaPayload._data.key.remoteJid) || '';
      if (wahaUserId) {
        userId = String(wahaUserId).replace('@s.whatsapp.net', '@c.us');
        extractionMethod = 'WAHA Trigger node (last resort)';
        console.log('✅ Found userId in WAHA Trigger node:', userId);
      }
    }
  } catch (error) {
    console.log('Could not access WAHA Trigger node:', error.message);
  }
  
  // If still no userId, throw error with full context
  if (!userId) {
    throw new Error('Missing userId. Check execution log for input data.');
  }
}

console.log('\n✅ SUCCESS - All fields extracted:');
console.log('  userId:', userId);
console.log('  question:', question.substring(0, 50));
console.log('  messageId:', messageId);
console.log('  sessionId:', sessionId);
console.log('  hasImageAnalysis:', hasImageAnalysis);
console.log('  promptText length:', promptText.length);
console.log('=== END PREPARE AI INPUT ===\n');

return [{
  json: {
    question: question,
    promptText: promptText, // CRITICAL: Pre-built prompt with imageAnalysis
    sessionId: sessionId,
    messageId: messageId,
    requiresVoiceResponse: requiresVoiceResponse,
    userId: userId,
    source: source,
    store_name: store_name,
    text: question,
    transcript: question,
    transcription: question,
    imageAnalysis: imageAnalysis, // Keep for backward compatibility
    hasImageAnalysis: hasImageAnalysis // Flag for Search Knowledge Base
  }
}];
