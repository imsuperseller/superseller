#!/usr/bin/env node

/**
 * 🔧 ADD MISSING EMAIL NODE TO SHELLY'S N8N WORKFLOW
 * 
 * The workflow is missing the email node that should send notifications to Shelly
 */

import axios from 'axios';

class AddMissingEmailNode {
  constructor() {
    this.n8nConfig = {
      baseUrl: 'https://shellyins.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
        'Content-Type': 'application/json'
      }
    };

    this.workflowId = 'cvcjOW0zOZVIvO2X';
  }

  async addEmailNode() {
    console.log('🔧 ADDING MISSING EMAIL NODE');
    console.log('=============================');
    console.log(`🎯 Workflow ID: ${this.workflowId}`);
    console.log(`☁️ n8n Instance: ${this.n8nConfig.baseUrl}`);
    console.log('');

    try {
      // Step 1: Get current workflow
      console.log('📥 Fetching current workflow...');
      const getResponse = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, {
        headers: this.n8nConfig.headers
      });

      const workflow = getResponse.data;
      console.log(`📋 Workflow: ${workflow.name}`);
      console.log(`📊 Current nodes: ${workflow.nodes.length}`);

      // Step 2: Add email node
      const emailNode = {
        id: "email-notification",
        name: "Email to Shelly",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [900, 0],
        parameters: {
          toEmail: "shellypensia@gmail.com",
          subject: "Family Insurance Profile Ready - Ready for Contact",
          text: `Hi Shelly,

Family insurance profile has been generated and uploaded successfully!

📋 Family Profile: {{$('Upload Family Profile').item.json.documentUrl}}
👨‍👩‍👧‍👦 Member Profiles: {{$('Upload Member Profiles').item.json.documentUrls}}

📊 Client Details:
- Main Client: {{$json.main_client_name}}
- Family Members: {{$json.family_member_count}}
- Total Profiles: {{$json.total_profiles}}

🎯 Ready to contact the main customer!

Best regards,
Rensto Automation`
        },
        credentials: {
          smtp: {
            id: 'shelly-smtp',
            name: 'Shelly SMTP'
          }
        }
      };

      workflow.nodes.push(emailNode);
      console.log('✅ Email node added to workflow');

      // Step 3: Update connections
      // Remove the direct connection from Upload Member Profiles to Response
      if (workflow.connections['Upload Member Profiles']) {
        delete workflow.connections['Upload Member Profiles'];
      }

      // Add new connections
      workflow.connections['Upload Member Profiles'] = {
        main: [['Email to Shelly']]
      };

      workflow.connections['Email to Shelly'] = {
        main: [['Response to Make.com']]
      };

      console.log('✅ Connections updated');

      // Step 4: Update workflow
      console.log('📤 Updating workflow...');
      const updateResponse = await axios.put(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, workflow, {
        headers: this.n8nConfig.headers
      });

      console.log('✅ Workflow updated successfully');

      // Step 5: Verify the fix
      console.log('🔍 Verifying fix...');
      const verifyResponse = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, {
        headers: this.n8nConfig.headers
      });

      const updatedWorkflow = verifyResponse.data;
      const emailNodeExists = updatedWorkflow.nodes.find(node => node.name === 'Email to Shelly');
      
      if (emailNodeExists) {
        console.log('✅ Email node verified in workflow');
        console.log(`📊 Total nodes: ${updatedWorkflow.nodes.length}`);
      } else {
        console.log('❌ Email node not found after update');
      }

      console.log('\n🎉 EMAIL NODE ADDED SUCCESSFULLY!');
      console.log('==================================');
      console.log('✅ Email node added to workflow');
      console.log('✅ Connections updated');
      console.log('✅ Workflow structure corrected');
      console.log('');
      console.log('📋 WORKFLOW NOW HAS:');
      console.log('   1. Webhook Trigger');
      console.log('   2. Upload Family Profile');
      console.log('   3. Upload Member Profiles');
      console.log('   4. Email to Shelly ← NEW');
      console.log('   5. Response to Make.com');
      console.log('');
      console.log('📋 NEXT STEPS FOR SHELLY:');
      console.log('   1. Go to n8n interface: https://shellyins.app.n8n.cloud');
      console.log('   2. Navigate to Settings → Credentials');
      console.log('   3. Create "Shelly SMTP" credential:');
      console.log('      - Host: smtp.gmail.com');
      console.log('      - Port: 587');
      console.log('      - User: shellypensia@gmail.com');
      console.log('      - Password: [Gmail App Password]');
      console.log('   4. Test the workflow');
      console.log('');
      console.log('🔗 Workflow URL: https://shellyins.app.n8n.cloud/workflow/cvcjOW0zOZVIvO2X');

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to add email node:', error.message);
      if (error.response) {
        console.error('📋 Response status:', error.response.status);
        console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2));
      }
      return { success: false, error: error.message };
    }
  }
}

// Execute email node addition
const adder = new AddMissingEmailNode();
adder.addEmailNode().catch(console.error);

export default AddMissingEmailNode;
