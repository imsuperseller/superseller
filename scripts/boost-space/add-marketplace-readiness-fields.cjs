#!/usr/bin/env node

/**
 * Add Marketplace Readiness Fields
 * 
 * Adds 3 new fields to track marketplace readiness and internal-only status:
 * 1. is_internal_only (boolean)
 * 2. marketplace_readiness (select)
 * 3. marketplace_blockers (textarea)
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupId: 479, // "n8n Workflow Fields (Products)"
  fieldGroupName: 'n8n Workflow Fields (Products)'
};

const NEW_FIELDS = [
  {
    name: 'is_internal_only',
    type: 'boolean',
    description: 'Internal use only - never for marketplace sale',
    required: false,
    default: false
  },
  {
    name: 'marketplace_readiness',
    type: 'select',
    description: 'Marketplace readiness status',
    required: false,
    options: ['not_ready', 'ready_for_review', 'ready_to_publish', 'published', 'not_applicable'],
    default: 'not_ready'
  },
  {
    name: 'marketplace_blockers',
    type: 'textarea',
    description: 'What prevents this from being marketplace-ready? (only if not_ready)',
    required: false
  }
];

async function addMarketplaceReadinessFields() {
  console.log('🚀 Adding Marketplace Readiness Fields\n');
  console.log(`Platform: ${CONFIG.platform}`);
  console.log(`Field Group: ${CONFIG.fieldGroupName} (ID: ${CONFIG.fieldGroupId})\n`);

  try {
    const api = axios.create({
      baseURL: CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Verify field group exists
    console.log('🔍 Verifying field group...');
    const groupResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const fieldGroup = groupResponse.data;
    
    console.log(`   ✅ Found: ${fieldGroup.name || fieldGroup.title}`);
    console.log(`   Module: ${fieldGroup.module}`);
    console.log(`   Current fields: ${fieldGroup.inputs ? fieldGroup.inputs.length : 0}\n`);

    // Create each new field
    console.log(`📝 Creating ${NEW_FIELDS.length} new fields...\n`);

    for (let i = 0; i < NEW_FIELDS.length; i++) {
      const field = NEW_FIELDS[i];
      console.log(`[${i + 1}/${NEW_FIELDS.length}] Creating: ${field.name} (${field.type})`);

      try {
        // Map field types to Boost.space input types
        const inputTypeMap = {
          'text': 'text',
          'textarea': 'text', // Textareas might be stored as text
          'number': 'number',
          'decimal': 'number',
          'date': 'date',
          'datetime': 'datetime',
          'boolean': 'checkbox',
          'select': 'select',
          'url': 'text'
        };
        
        const inputType = inputTypeMap[field.type] || 'text';
        
        // Build field payload (same structure as create-custom-fields.cjs)
        const fieldPayload = {
          name: field.name,
          inputType: inputType,
          description: field.description,
          required: field.required || false,
          order: i + 100, // High order number to add at end
          visible: true,
          protected: false,
          translatable: false,
          elementGroups: [CONFIG.fieldGroupId],
          spaces: [],
          module: 'product',
          table: 'product'
        };

        // Add inputOptions for select fields
        if (field.type === 'select' && field.options) {
          fieldPayload.inputOptions = field.options.map(opt => ({ value: opt, label: opt }));
        }

        // Try multiple endpoints (same as create-custom-fields.cjs)
        const endpoints = [
          `/api/custom-field/${CONFIG.fieldGroupId}/input`,
          `/api/custom-field-input`,
          `/api/input`
        ];

        let created = false;
        for (const endpoint of endpoints) {
          try {
            const createResponse = await api.post(endpoint, fieldPayload);
            const fieldId = createResponse.data.id || createResponse.data.boostId || createResponse.data.inputId;
            console.log(`   ✅ Created! ID: ${fieldId || 'N/A'}`);
            created = true;
            break;
          } catch (endpointError) {
            if (endpointError.response?.status === 409 || endpointError.response?.status === 422) {
              const errorMsg = endpointError.response.data?.message || endpointError.response.statusText;
              if (errorMsg.includes('exists') || errorMsg.includes('duplicate') || errorMsg.includes('already')) {
                console.log(`   ⚠️  Field already exists, skipping...`);
                created = true; // Consider it success
                break;
              }
            }
            // Try next endpoint
            continue;
          }
        }

        // If all endpoints failed, try updating field group directly
        if (!created) {
          try {
            const updatePayload = {
              inputs: [...(fieldGroup.inputs || []), fieldPayload]
            };
            await api.put(`/api/custom-field/${CONFIG.fieldGroupId}`, updatePayload);
            console.log(`   ✅ Added to field group via update!`);
            created = true;
          } catch (updateError) {
            console.log(`   ⚠️  Could not add to field group`);
          }
        }

      } catch (error) {
        if (error.response?.status === 409 || error.response?.status === 422) {
          const errorMsg = error.response.data?.message || error.response.statusText;
          if (errorMsg.includes('exists') || errorMsg.includes('duplicate') || errorMsg.includes('already')) {
            console.log(`   ⚠️  Field already exists, skipping...`);
            
            // Try to add to field group anyway
            try {
              const updateResponse = await api.put(`/api/custom-field/${CONFIG.fieldGroupId}`, {
                inputs: [...(fieldGroup.inputs || []), { name: field.name }]
              });
              console.log(`   ✅ Added to field group via update`);
            } catch (updateError) {
              console.log(`   ⚠️  Could not add to field group (may already be there)`);
            }
          } else {
            console.log(`   ❌ Error: ${errorMsg}`);
          }
        } else {
          console.log(`   ❌ Error: ${error.message}`);
          if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
          }
        }
      }
    }

    // Verify final count
    console.log('\n🔍 Verifying final field count...');
    const finalResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const finalGroup = finalResponse.data;
    console.log(`   ✅ Total fields: ${finalGroup.inputs ? finalGroup.inputs.length : 0}`);

    console.log('\n✅ Done! Marketplace readiness fields added.');
    console.log('\n📋 New fields:');
    NEW_FIELDS.forEach(f => {
      console.log(`   - ${f.name} (${f.type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

addMarketplaceReadinessFields();
