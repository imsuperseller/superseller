#!/usr/bin/env node

/**
 * ADD FIELDS VIA MCP
 * Use the fixed MCP server to add fields to databases
 */

import { spawn } from 'child_process';

const CUSTOMER_MANAGEMENT_DB_ID = '6b8cbaea-73f1-4094-aa55-2b4a858fd353';
const PROJECT_TRACKING_DB_ID = '6f911ef7-d44f-4b34-82ab-ca1b9fbd0ab4';

function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000),
      method: method,
      params: params
    };

    const mcpProcess = spawn('node', ['scripts/fixed-notion-mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`MCP process exited with code ${code}: ${errorOutput}`));
      }
    });

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

async function addFieldsToDatabase(databaseId, fields, databaseName) {
  console.log(`\n🔧 Adding fields to ${databaseName} database via MCP...`);
  
  try {
    // Get current database structure
    console.log('   Getting current database structure...');
    const dbResponse = await sendMCPRequest('tools/call', {
      name: 'notion-get-database',
      arguments: { database_id: databaseId }
    });
    
    const db = JSON.parse(dbResponse.result.content[0].text);
    console.log(`   Current fields: ${Object.keys(db.properties).length}`);
    
    // Prepare new properties
    const newProperties = { ...db.properties };
    
    // Add new fields
    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      if (!newProperties[fieldName]) {
        console.log(`   Adding field: ${fieldName}`);
        newProperties[fieldName] = fieldConfig;
      } else {
        console.log(`   ⚠️  ${fieldName} already exists, skipping`);
      }
    }
    
    // Update database with new properties
    console.log('   Updating database with new properties...');
    const updateResponse = await sendMCPRequest('tools/call', {
      name: 'notion-update-database',
      arguments: {
        database_id: databaseId,
        properties: newProperties
      }
    });
    
    console.log('   ✅ Database updated successfully');
    
    // Verify the update
    console.log('   Verifying update...');
    const verifyResponse = await sendMCPRequest('tools/call', {
      name: 'notion-get-database',
      arguments: { database_id: databaseId }
    });
    
    const updatedDb = JSON.parse(verifyResponse.result.content[0].text);
    console.log(`   Final fields: ${Object.keys(updatedDb.properties).length}`);
    
    return updatedDb;
    
  } catch (error) {
    console.error(`   ❌ Error adding fields to ${databaseName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Adding Fields via MCP...');
  
  // Customer Management Database Fields
  const CUSTOMER_MANAGEMENT_FIELDS = {
    'Company Name': {
      type: 'rich_text',
      rich_text: {}
    },
    'Contact Email': {
      type: 'email',
      email: {}
    },
    'Phone Number': {
      type: 'phone_number',
      phone_number: {}
    },
    'Industry': {
      type: 'select',
      select: {
        options: [
          { name: 'Technology', color: 'blue' },
          { name: 'Healthcare', color: 'green' },
          { name: 'Finance', color: 'yellow' },
          { name: 'Education', color: 'purple' },
          { name: 'Retail', color: 'orange' },
          { name: 'Manufacturing', color: 'red' },
          { name: 'Other', color: 'gray' }
        ]
      }
    },
    'Customer Status': {
      type: 'select',
      select: {
        options: [
          { name: 'Active', color: 'green' },
          { name: 'Inactive', color: 'red' },
          { name: 'Prospect', color: 'yellow' },
          { name: 'Churned', color: 'gray' }
        ]
      }
    },
    'Subscription Plan': {
      type: 'select',
      select: {
        options: [
          { name: 'Basic', color: 'blue' },
          { name: 'Professional', color: 'green' },
          { name: 'Enterprise', color: 'purple' },
          { name: 'Custom', color: 'orange' }
        ]
      }
    },
    'Monthly Revenue': {
      type: 'number',
      number: {
        format: 'currency',
        currency: 'USD'
      }
    },
    'Onboarding Date': {
      type: 'date',
      date: {}
    },
    'Last Contact Date': {
      type: 'date',
      date: {}
    },
    'Customer Success Manager': {
      type: 'rich_text',
      rich_text: {}
    },
    'Notes': {
      type: 'rich_text',
      rich_text: {}
    },
    'RGID': {
      type: 'rich_text',
      rich_text: {}
    }
  };

  // Project Tracking Database Fields
  const PROJECT_TRACKING_FIELDS = {
    'Project Name': {
      type: 'rich_text',
      rich_text: {}
    },
    'Customer': {
      type: 'rich_text',
      rich_text: {}
    },
    'Project Type': {
      type: 'select',
      select: {
        options: [
          { name: 'Website Development', color: 'blue' },
          { name: 'Mobile App', color: 'green' },
          { name: 'System Integration', color: 'purple' },
          { name: 'Consulting', color: 'yellow' },
          { name: 'Maintenance', color: 'orange' },
          { name: 'Other', color: 'gray' }
        ]
      }
    },
    'Status': {
      type: 'select',
      select: {
        options: [
          { name: 'Planning', color: 'yellow' },
          { name: 'In Progress', color: 'blue' },
          { name: 'Review', color: 'orange' },
          { name: 'Completed', color: 'green' },
          { name: 'On Hold', color: 'red' },
          { name: 'Cancelled', color: 'gray' }
        ]
      }
    },
    'Priority': {
      type: 'select',
      select: {
        options: [
          { name: 'Low', color: 'blue' },
          { name: 'Medium', color: 'yellow' },
          { name: 'High', color: 'red' },
          { name: 'Critical', color: 'red' }
        ]
      }
    },
    'Start Date': {
      type: 'date',
      date: {}
    },
    'Due Date': {
      type: 'date',
      date: {}
    },
    'Budget': {
      type: 'number',
      number: {
        format: 'currency',
        currency: 'USD'
      }
    },
    'Progress': {
      type: 'number',
      number: {
        format: 'percent'
      }
    },
    'Project Manager': {
      type: 'rich_text',
      rich_text: {}
    },
    'Team Members': {
      type: 'rich_text',
      rich_text: {}
    },
    'Description': {
      type: 'rich_text',
      rich_text: {}
    },
    'RGID': {
      type: 'rich_text',
      rich_text: {}
    }
  };
  
  try {
    // Add fields to Customer Management database
    const customerDb = await addFieldsToDatabase(
      CUSTOMER_MANAGEMENT_DB_ID, 
      CUSTOMER_MANAGEMENT_FIELDS, 
      'Customer Management'
    );
    
    // Add fields to Project Tracking database
    const projectDb = await addFieldsToDatabase(
      PROJECT_TRACKING_DB_ID, 
      PROJECT_TRACKING_FIELDS, 
      'Project Tracking'
    );
    
    if (customerDb && projectDb) {
      console.log('\n🎉 SUCCESS: All fields added via MCP!');
      console.log('\n📊 Final Status:');
      console.log(`   Customer Management: ${Object.keys(customerDb.properties).length} fields`);
      console.log(`   Project Tracking: ${Object.keys(projectDb.properties).length} fields`);
    } else {
      console.log('\n❌ FAILURE: Could not add fields via MCP');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
