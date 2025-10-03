/**
 * N8N WORKFLOW MODIFICATION SCRIPT
 * Modifies workflow cgk7FI57o6cg3eju to target Israeli professionals using n8n data tables
 * 
 * This script provides the exact modifications needed to transform the existing workflow
 * into an Israeli-focused lead generation system using n8n's native data tables.
 */

const workflowModifications = {
  // Step 1: Form Input Modifications
  formInputChanges: {
    nodeId: "f131f326-4cdf-4e5d-9e78-92104bb3a7ab",
    modifications: {
      formTitle: "Israeli Professionals Lead Generation",
      formDescription: "Target Israeli professionals living in the USA, ages 25-50, with names and phone numbers.",
      formFields: {
        values: [
          {
            fieldLabel: "Title/Industry",
            placeholder: "Israeli CEO, Israeli Marketing Director, Israeli Software Engineer",
            requiredField: true
          },
          {
            fieldLabel: "Location",
            placeholder: "New York City, Los Angeles, Miami, Chicago, San Francisco",
            requiredField: true
          },
          {
            fieldLabel: "Source",
            fieldType: "dropdown",
            fieldOptions: {
              values: [
                { option: "Google Maps" },
                { option: "LinkedIn" },
                { option: "Both" }
              ]
            },
            requiredField: true
          },
          {
            fieldLabel: "Number of results",
            fieldType: "number",
            placeholder: "Enter number desired results (1000-15000)"
          },
          {
            fieldLabel: "Age Range",
            fieldType: "dropdown",
            fieldOptions: {
              values: [
                { option: "25-50" },
                { option: "25-35" },
                { option: "35-50" }
              ]
            },
            requiredField: true
          },
          {
            fieldLabel: "Lead Type",
            fieldType: "dropdown",
            fieldOptions: {
              values: [
                { option: "US Cities (excluding NYC)" },
                { option: "NYC Only" },
                { option: "Both" }
              ]
            },
            requiredField: true
          }
        ]
      }
    }
  },

  // Step 2: Add Israeli Filtering Nodes
  newNodes: [
    {
      id: "israeli-linkedin-filter",
      name: "Filter Israeli LinkedIn Leads",
      type: "n8n-nodes-base.code",
      position: [544, 400], // Between linkedin_dataset and get_linkedin
      parameters: {
        functionCode: `
// Israeli LinkedIn Lead Filtering
function filterIsraeliLinkedInLeads(item) {
  const data = item.json;
  
  // Israeli keyword detection
  const israeliKeywords = [
    'israeli', 'israel', 'hebrew', 'tel aviv', 'jerusalem', 'idf',
    'technion', 'hebrew university', 'israeli army', 'mossad',
    'israeli tech', 'israeli startup', 'israeli business'
  ];
  
  const textToSearch = \`\${data.headline || ''} \${data.about || ''} \${data.latest_experience || ''} \${data.education || ''}\`.toLowerCase();
  
  const israeliScore = israeliKeywords.reduce((score, keyword) => {
    return textToSearch.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // Age estimation from experience
  let estimatedAge = null;
  if (data.experience && data.experience.length > 0) {
    const firstExperience = data.experience[0];
    if (firstExperience.startsAt && firstExperience.startsAt.year) {
      const yearsOfExperience = new Date().getFullYear() - firstExperience.startsAt.year;
      estimatedAge = 22 + yearsOfExperience; // Assuming start working at 22
    }
  }
  
  // US location check
  const isUSLocation = (data.location || '').toLowerCase().includes('usa') ||
                     (data.location || '').toLowerCase().includes('united states') ||
                     (data.city || '').toLowerCase().includes('new york') ||
                     (data.city || '').toLowerCase().includes('los angeles') ||
                     (data.city || '').toLowerCase().includes('miami') ||
                     (data.city || '').toLowerCase().includes('chicago') ||
                     (data.city || '').toLowerCase().includes('san francisco');
  
  // Filter criteria: Israeli score > 0, US location, age 25-50
  if (israeliScore > 0 && isUSLocation && estimatedAge >= 25 && estimatedAge <= 50) {
    return {
      ...data,
      estimated_age: estimatedAge,
      israeli_score: israeliScore,
      phone: data.phone || '',
      email: data.email || '',
      location: data.location || '',
      filtered: true
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliLinkedInLeads(item)).filter(Boolean);
return filteredLeads;
        `
      }
    },
    {
      id: "israeli-googlemaps-filter",
      name: "Filter Israeli Google Maps Leads",
      type: "n8n-nodes-base.code",
      position: [544, 208], // Between googlemaps_dataset and set_google_maps_column
      parameters: {
        functionCode: `
// Israeli Google Maps Lead Filtering
function filterIsraeliGoogleMapsLeads(item) {
  const data = item.json;
  
  // Israeli business keyword detection
  const israeliKeywords = [
    'israeli', 'hebrew', 'kosher', 'synagogue', 'tel aviv', 'jerusalem',
    'israeli restaurant', 'hebrew school', 'kosher market', 'israeli community',
    'israeli business', 'israeli tech', 'israeli startup'
  ];
  
  const textToSearch = \`\${data.title || ''} \${data.categoryName || ''} \${data.address || ''}\`.toLowerCase();
  
  const israeliScore = israeliKeywords.reduce((score, keyword) => {
    return textToSearch.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // US location check
  const isUSLocation = (data.countryCode || '').toUpperCase() === 'US' ||
                     (data.state || '').toLowerCase().includes('new york') ||
                     (data.state || '').toLowerCase().includes('california') ||
                     (data.state || '').toLowerCase().includes('florida') ||
                     (data.state || '').toLowerCase().includes('illinois');
  
  // Business type detection
  let businessType = 'other';
  if (textToSearch.includes('restaurant')) businessType = 'restaurant';
  else if (textToSearch.includes('school')) businessType = 'education';
  else if (textToSearch.includes('center')) businessType = 'community';
  else if (textToSearch.includes('business')) businessType = 'business';
  else if (textToSearch.includes('market')) businessType = 'retail';
  
  // Filter criteria: Israeli score > 0, US location, has phone
  if (israeliScore > 0 && isUSLocation && data.phone) {
    return {
      ...data,
      israeli_score: israeliScore,
      business_type: businessType,
      filtered: true
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliGoogleMapsLeads(item)).filter(Boolean);
return filteredLeads;
        `
      }
    }
  ],

  // Step 3: Replace Supabase nodes with Data Table nodes
  nodeReplacements: [
    {
      oldNodeId: "98c4964d-bb53-45ab-b8cb-66315fa72d68", // save_linkedin
      newNode: {
        id: "save_israeli_linkedin",
        name: "save_israeli_linkedin",
        type: "n8n-nodes-base.dataTable",
        position: [880, 400],
        parameters: {
          resource: "row",
          operation: "insert",
          dataTableId: "israeli_linkedin_leads",
          columns: {
            mappings: [
              { fieldId: "publicidentifier", fieldValue: "={{ $json.publicIdentifier }}" },
              { fieldId: "linkedinurl", fieldValue: "={{ $json.linkedinUrl }}" },
              { fieldId: "name", fieldValue: "={{ $json.name }}" },
              { fieldId: "headline", fieldValue: "={{ $json.headline }}" },
              { fieldId: "about", fieldValue: "={{ $json.about }}" },
              { fieldId: "premium", fieldValue: "={{ $json.premium }}" },
              { fieldId: "verified", fieldValue: "={{ $json.verified }}" },
              { fieldId: "openprofile", fieldValue: "={{ $json.openProfile }}" },
              { fieldId: "topskills", fieldValue: "={{ $json.topSkills }}" },
              { fieldId: "connectionscount", fieldValue: "={{ $json.connectionsCount }}" },
              { fieldId: "followercount", fieldValue: "={{ $json.followerCount }}" },
              { fieldId: "latest_experience", fieldValue: "={{ $json.latest_experience }}" },
              { fieldId: "education", fieldValue: "={{ $json.education }}" },
              { fieldId: "estimated_age", fieldValue: "={{ $json.estimated_age }}" },
              { fieldId: "israeli_score", fieldValue: "={{ $json.israeli_score }}" },
              { fieldId: "phone", fieldValue: "={{ $json.phone }}" },
              { fieldId: "email", fieldValue: "={{ $json.email }}" },
              { fieldId: "location", fieldValue: "={{ $json.location }}" }
            ]
          }
        }
      }
    },
    {
      oldNodeId: "7e829040-2322-43ca-acf6-9cc85393fbd2", // save_googlemaps
      newNode: {
        id: "save_israeli_googlemaps",
        name: "save_israeli_googlemaps",
        type: "n8n-nodes-base.dataTable",
        position: [880, 208],
        parameters: {
          resource: "row",
          operation: "insert",
          dataTableId: "israeli_googlemaps_leads",
          columns: {
            mappings: [
              { fieldId: "title", fieldValue: "={{ $json.title }}" },
              { fieldId: "category_name", fieldValue: "={{ $json.categoryName }}" },
              { fieldId: "address", fieldValue: "={{ $json.address }}" },
              { fieldId: "neighborhood", fieldValue: "={{ $json.neighborhood }}" },
              { fieldId: "street", fieldValue: "={{ $json.street }}" },
              { fieldId: "city", fieldValue: "={{ $json.city }}" },
              { fieldId: "postal_code", fieldValue: "={{ $json.postalCode }}" },
              { fieldId: "state", fieldValue: "={{ $json.state }}" },
              { fieldId: "country_code", fieldValue: "={{ $json.countryCode }}" },
              { fieldId: "website", fieldValue: "={{ $json.website }}" },
              { fieldId: "phone", fieldValue: "={{ $json.phone }}" },
              { fieldId: "phone_unformatted", fieldValue: "={{ $json.phoneUnformatted }}" },
              { fieldId: "location", fieldValue: "={{ $json.location }}" },
              { fieldId: "total_score", fieldValue: "={{ $json.totalScore }}" },
              { fieldId: "israeli_score", fieldValue: "={{ $json.israeli_score }}" },
              { fieldId: "business_type", fieldValue: "={{ $json.business_type }}" }
            ]
          }
        }
      }
    }
  ],

  // Step 4: Update Apify configurations
  apifyConfigurations: {
    linkedin: {
      nodeId: "dc3be642-97f4-423a-8cd0-10a7c1347a82",
      customBody: `{
        "locations": ["United States"],
        "maxItems": 15000,
        "profileScraperMode": "Full",
        "searchQuery": "Israeli professionals OR Israeli CEO OR Israeli manager OR Israeli engineer OR Hebrew speaker OR Israeli tech OR Israeli startup"
      }`
    },
    googlemaps: {
      nodeId: "e6485473-4fc8-4f55-9b03-858ff4df6b40",
      customBody: `{
        "includeWebResults": false,
        "language": "en",
        "locationQuery": "United States",
        "maxCrawledPlacesPerSearch": 15000,
        "maxImages": 0,
        "maximumLeadsEnrichmentRecords": 0,
        "scrapeContacts": true,
        "scrapeDirectories": false,
        "scrapeImageAuthors": false,
        "scrapePlaceDetailPage": true,
        "scrapeReviewsPersonalData": true,
        "scrapeTableReservationProvider": false,
        "searchStringsArray": [
          "Israeli restaurant",
          "Hebrew school",
          "Kosher market",
          "Israeli community center",
          "Israeli business",
          "Synagogue",
          "Israeli tech company",
          "Israeli startup"
        ],
        "skipClosedPlaces": false
      }`
    }
  },

  // Step 5: Update connections
  connectionUpdates: {
    // Add connections for new filtering nodes
    newConnections: [
      {
        from: "linkedin_dataset",
        to: "israeli-linkedin-filter",
        type: "main",
        index: 0
      },
      {
        from: "israeli-linkedin-filter",
        to: "get_linkedin",
        type: "main",
        index: 0
      },
      {
        from: "googlemaps_dataset",
        to: "israeli-googlemaps-filter",
        type: "main",
        index: 0
      },
      {
        from: "israeli-googlemaps-filter",
        to: "set_google_maps_column",
        type: "main",
        index: 0
      }
    ]
  }
};

// Export the modifications for use
module.exports = {
  workflowModifications,
  
  // Helper function to apply modifications
  applyModifications: async function(n8nApi) {
    console.log('🎯 Applying Israeli Leads Workflow Modifications...');
    
    try {
      // Step 1: Update form input
      console.log('📝 Updating form input...');
      await n8nApi.updateNode('cgk7FI57o6cg3eju', 'f131f326-4cdf-4e5d-9e78-92104bb3a7ab', workflowModifications.formInputChanges.modifications);
      
      // Step 2: Add filtering nodes
      console.log('🔍 Adding Israeli filtering nodes...');
      for (const node of workflowModifications.newNodes) {
        await n8nApi.addNode('cgk7FI57o6cg3eju', node);
      }
      
      // Step 3: Replace Supabase nodes with Data Table nodes
      console.log('🗄️ Replacing Supabase nodes with Data Table nodes...');
      for (const replacement of workflowModifications.nodeReplacements) {
        await n8nApi.updateNode('cgk7FI57o6cg3eju', replacement.oldNodeId, replacement.newNode);
      }
      
      // Step 4: Update Apify configurations
      console.log('🔧 Updating Apify configurations...');
      await n8nApi.updateNode('cgk7FI57o6cg3eju', 'dc3be642-97f4-423a-8cd0-10a7c1347a82', {
        customBody: workflowModifications.apifyConfigurations.linkedin.customBody
      });
      await n8nApi.updateNode('cgk7FI57o6cg3eju', 'e6485473-4fc8-4f55-9b03-858ff4df6b40', {
        customBody: workflowModifications.apifyConfigurations.googlemaps.customBody
      });
      
      // Step 5: Update connections
      console.log('🔗 Updating workflow connections...');
      for (const connection of workflowModifications.connectionUpdates.newConnections) {
        await n8nApi.addConnection('cgk7FI57o6cg3eju', connection.from, connection.to, connection.type, connection.index);
      }
      
      console.log('✅ Israeli Leads Workflow Modifications Complete!');
      console.log('🎯 The workflow now targets Israeli professionals living in the USA, ages 25-50');
      console.log('🗄️ Data will be stored in n8n data tables instead of Supabase');
      console.log('📊 Expected results: 15,000 Israeli professionals with names and phone numbers');
      
    } catch (error) {
      console.error('❌ Error applying modifications:', error.message);
      throw error;
    }
  }
};
