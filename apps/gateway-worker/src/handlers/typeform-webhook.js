/**
 * Typeform Webhook Handler - Cloudflare Worker
 * Handles Typeform form submissions and processes them through MCP ecosystem
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Typeform-Signature',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the request body
      const body = await request.text();
      const signature = request.headers.get('X-Typeform-Signature');
      
      // Validate webhook signature
      if (!(await validateWebhookSignature(body, signature, env.TYPEFORM_WEBHOOK_SECRET))) {
        console.error('Invalid webhook signature');
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse the form response
      const formResponse = JSON.parse(body);
      
      // Process the form response
      const result = await processFormResponse(formResponse, env);
      
      // Log the result
      console.log('Form response processed:', result);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Form response processed successfully',
        result 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

/**
 * Validate Typeform webhook signature
 */
async function validateWebhookSignature(body, signature, secret) {
  if (!signature || !secret) {
    return false;
  }
  
  // Typeform uses HMAC-SHA256 for webhook validation
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return signature === `sha256=${expectedSignature}`;
}

/**
 * Process form response and trigger MCP workflows
 */
async function processFormResponse(formResponse, env) {
  const { form_id, event_id, event_type, form_response } = formResponse;
  
  // Extract form data
  const formData = extractFormData(form_response);
  
  // Determine customer based on form ID or form data
  const customer = await identifyCustomer(form_id, formData, env);
  
  // Process based on form type
  const result = await routeFormSubmission(customer, formData, env);
  
  return {
    form_id,
    event_id,
    customer,
    formData,
    result,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract structured data from form response
 */
function extractFormData(formResponse) {
  const data = {};
  
  if (formResponse.answers) {
    formResponse.answers.forEach(answer => {
      const fieldName = answer.field?.ref || answer.field?.id;
      if (fieldName) {
        data[fieldName] = answer[answer.type] || answer.text || answer.choice?.label;
      }
    });
  }
  
  return {
    ...data,
    submitted_at: formResponse.submitted_at,
    token: formResponse.token,
    response_id: formResponse.response_id
  };
}

/**
 * Identify customer based on form ID or form data
 */
async function identifyCustomer(formId, formData, env) {
  // Map form IDs to customers
  const formCustomerMap = {
    'customer_onboarding': 'Rensto',
    'lead_qualification': 'Rensto',
    'tax4us_inquiry': 'Tax4Us',
    'shelly_insurance': 'Shelly',
    'wonder_care': 'Wonder.care',
    'local_il_leads': 'Local-il'
  };
  
  // Check form ID mapping first
  if (formCustomerMap[formId]) {
    return formCustomerMap[formId];
  }
  
  // Check form data for customer indicators
  if (formData.company) {
    const company = formData.company.toLowerCase();
    if (company.includes('tax4us') || company.includes('tax')) return 'Tax4Us';
    if (company.includes('shelly') || company.includes('insurance')) return 'Shelly';
    if (company.includes('wonder') || company.includes('care')) return 'Wonder.care';
    if (company.includes('local') || company.includes('il')) return 'Local-il';
  }
  
  // Default to Rensto for new inquiries
  return 'Rensto';
}

/**
 * Route form submission to appropriate MCP workflow
 */
async function routeFormSubmission(customer, formData, env) {
  const results = [];
  
  // Always save to Airtable
  try {
    const airtableResult = await saveToAirtable(customer, formData, env);
    results.push({ system: 'Airtable', success: true, result: airtableResult });
  } catch (error) {
    results.push({ system: 'Airtable', success: false, error: error.message });
  }
  
  // Route to customer-specific workflows
  switch (customer) {
    case 'Tax4Us':
      try {
        const n8nResult = await triggerN8NWorkflow('tax4us-lead-processing', formData, env);
        results.push({ system: 'n8n', success: true, result: n8nResult });
      } catch (error) {
        results.push({ system: 'n8n', success: false, error: error.message });
      }
      break;
      
    case 'Shelly':
      try {
        const makeResult = await triggerMakeWorkflow('shelly-lead-processing', formData, env);
        results.push({ system: 'Make.com', success: true, result: makeResult });
      } catch (error) {
        results.push({ system: 'Make.com', success: false, error: error.message });
      }
      break;
      
    case 'Wonder.care':
      try {
        const makeResult = await triggerMakeWorkflow('wonder-care-lead-processing', formData, env);
        results.push({ system: 'Make.com', success: true, result: makeResult });
      } catch (error) {
        results.push({ system: 'Make.com', success: false, error: error.message });
      }
      break;
      
    case 'Local-il':
      try {
        const makeResult = await triggerMakeWorkflow('local-il-lead-processing', formData, env);
        results.push({ system: 'Make.com', success: true, result: makeResult });
      } catch (error) {
        results.push({ system: 'Make.com', success: false, error: error.message });
      }
      break;
      
    default: // Rensto
      try {
        const n8nResult = await triggerN8NWorkflow('rensto-lead-processing', formData, env);
        results.push({ system: 'n8n', success: true, result: n8nResult });
      } catch (error) {
        results.push({ system: 'n8n', success: false, error: error.message });
      }
  }
  
  return results;
}

/**
 * Save form data to Airtable
 */
async function saveToAirtable(customer, formData, env) {
  const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Leads`;
  const headers = {
    'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  const record = {
    fields: {
      'Name': formData.name || formData.full_name || 'Unknown',
      'Full Name': formData.name || formData.full_name || 'Unknown',
      'Email': formData.email || '',
      'Phone Number': formData.phone || formData.phone_number || '',
      'Source': 'Website Form',
      'Status': 'New',
      'Notes': `Customer: ${customer}\nForm Data: ${JSON.stringify(formData)}`,
      'Lead ID': `typeform_${Date.now()}`,
      'RGID': `RGID_LEAD_${Date.now()}_${customer}`
    }
  };
  
  const response = await fetch(airtableUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(record)
  });
  
  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Trigger n8n workflow
 */
async function triggerN8NWorkflow(workflowName, formData, env) {
  // n8n webhooks use GET requests with query parameters
  // Simplify the data to avoid complex object serialization issues
  const simpleData = {
    source: 'typeform-webhook',
    timestamp: new Date().toISOString(),
    customer: 'Rensto',
    form_id: formData.form_id || 'unknown',
    submitted_at: formData.submitted_at || new Date().toISOString(),
    token: formData.token || 'unknown'
  };
  
  const params = new URLSearchParams(simpleData);
  const n8nUrl = `${env.N8N_BASE_URL}/webhook/${workflowName}?${params}`;
  
  console.log('n8n URL:', n8nUrl);
  console.log('n8n Base URL:', env.N8N_BASE_URL);
  
  const response = await fetch(n8nUrl, {
    method: 'GET'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`n8n API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Trigger Make.com workflow
 */
async function triggerMakeWorkflow(workflowName, formData, env) {
  const makeUrl = `${env.MAKE_BASE_URL}/webhook/${workflowName}`;
  
  const response = await fetch(makeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.MAKE_API_KEY}`
    },
    body: JSON.stringify({
      formData,
      source: 'typeform-webhook',
      timestamp: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error(`Make.com API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}
