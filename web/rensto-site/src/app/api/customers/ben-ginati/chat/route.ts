import { NextRequest, NextResponse } from 'next/server';

// AI Chat Agent for Ben's n8n Cloud Integration
class BenChatAgent {
  private knowledgeBase = {
    'gmail setup': {
      response: `📧 **Gmail Setup in n8n Cloud:**

1. **Go to your n8n Cloud instance**: https://tax4usllc.app.n8n.cloud
2. **Navigate to Settings** → **Credentials**
3. **Click "Add Credential"**
4. **Select "Gmail"** from the list
5. **Choose "Gmail OAuth2 API"**
6. **Click "Create"**
7. **Follow the OAuth2 flow**:
   - Authorize n8n to access your Gmail
   - Grant necessary permissions
8. **Save the credential** with a descriptive name (e.g., "Tax4US Gmail")
9. **Test the connection** to ensure it works

**Note**: You already have Microsoft Outlook working (26 nodes), so Gmail is optional unless you need it for specific workflows.`,
      category: 'email'
    },
    'google sheets': {
      response: `📊 **Google Sheets Setup in n8n Cloud:**

1. **Go to your n8n Cloud instance**: https://tax4usllc.app.n8n.cloud
2. **Navigate to Settings** → **Credentials**
3. **Click "Add Credential"**
4. **Select "Google Sheets"** from the list
5. **Choose "Google Sheets OAuth2 API"**
6. **Click "Create"**
7. **Follow the OAuth2 flow**:
   - Authorize n8n to access your Google Sheets
   - Grant necessary permissions
8. **Save the credential** with a descriptive name (e.g., "Tax4US Google Sheets")
9. **Test the connection** to ensure it works

**Good news**: You already have Google Sheets working (10 nodes) in your workflows!`,
      category: 'data'
    },
    'openai setup': {
      response: `🤖 **OpenAI Setup in n8n Cloud:**

1. **Go to your n8n Cloud instance**: https://tax4usllc.app.n8n.cloud
2. **Navigate to Settings** → **Credentials**
3. **Click "Add Credential"**
4. **Select "OpenAI"** from the list
5. **Choose "OpenAI API"**
6. **Click "Create"**
7. **Enter your OpenAI API key**:
   - Get it from https://platform.openai.com/api-keys
   - Paste it in the "API Key" field
8. **Save the credential** with a descriptive name (e.g., "Tax4US OpenAI")
9. **Test the connection** to ensure it works

**Great news**: You already have OpenAI working (6 nodes) for content generation!`,
      category: 'ai'
    },
    'workflow help': {
      response: `🔄 **Workflow Management Help:**

**To Activate a Workflow:**
1. Go to your n8n Cloud instance
2. Find the workflow you want to activate
3. Click the toggle switch to turn it "ON"
4. The workflow will start running automatically

**To Deactivate a Workflow:**
1. Find the active workflow
2. Click the toggle switch to turn it "OFF"
3. The workflow will stop running

**Current Active Workflows (11):**
- Tax4US Email workflows
- Blog Agent - Tax4Us
- Content Agent workflows
- Social Media Agent
- Podcast Agent

**Need help with a specific workflow?** Let me know which one!`,
      category: 'workflow'
    },
    'google drive': {
      response: `📁 **Google Drive Setup (Optional):**

1. **Go to your n8n Cloud instance**: https://tax4usllc.app.n8n.cloud
2. **Navigate to Settings** → **Credentials**
3. **Click "Add Credential"**
4. **Select "Google Drive"** from the list
5. **Choose "Google Drive OAuth2 API"**
6. **Click "Create"**
7. **Follow the OAuth2 flow**:
   - Authorize n8n to access your Google Drive
   - Grant necessary permissions
8. **Save the credential** with a descriptive name (e.g., "Tax4US Google Drive")
9. **Test the connection** to ensure it works

**Note**: This is optional for document storage and sharing. Your current workflows work great without it!`,
      category: 'storage'
    },
    'social media': {
      response: `📱 **Social Media Integration (Future):**

Currently, you don't have social media workflows, but here's how to set them up when needed:

**For Facebook:**
1. Go to Settings → Credentials
2. Add "Facebook" credential
3. Follow OAuth2 flow

**For LinkedIn:**
1. Go to Settings → Credentials
2. Add "LinkedIn" credential
3. Follow OAuth2 flow

**For Twitter:**
1. Go to Settings → Credentials
2. Add "Twitter" credential
3. Follow OAuth2 flow

**Current Status**: You have a "Social Media Agent" workflow that's active, so you might already have some social media integrations working!`,
      category: 'social'
    },
    'default': {
      response: `👋 **Hello! I'm your AI assistant for Tax4US n8n integration.**

**What I can help you with:**
- 📧 Email setup (Gmail, Outlook)
- 📊 Data processing (Google Sheets)
- 🤖 AI content generation (OpenAI)
- 🔄 Workflow management
- 📁 File storage (Google Drive)
- 📱 Social media integration

**Your current working integrations:**
✅ Microsoft Outlook (26 nodes)
✅ Google Sheets (10 nodes)
✅ OpenAI (6 nodes)
✅ Webhooks (17 nodes)
✅ Scheduling (10 nodes)

**What would you like help with today?**`,
      category: 'general'
    }
  };

  private getResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords
    if (lowerMessage.includes('gmail') || lowerMessage.includes('email')) {
      return this.knowledgeBase['gmail setup'].response;
    }
    
    if (lowerMessage.includes('google sheets') || lowerMessage.includes('sheets')) {
      return this.knowledgeBase['google sheets'].response;
    }
    
    if (lowerMessage.includes('openai') || lowerMessage.includes('ai') || lowerMessage.includes('content generation')) {
      return this.knowledgeBase['openai setup'].response;
    }
    
    if (lowerMessage.includes('workflow') || lowerMessage.includes('activate') || lowerMessage.includes('deactivate')) {
      return this.knowledgeBase['workflow help'].response;
    }
    
    if (lowerMessage.includes('google drive') || lowerMessage.includes('drive')) {
      return this.knowledgeBase['google drive'].response;
    }
    
    if (lowerMessage.includes('social') || lowerMessage.includes('facebook') || lowerMessage.includes('linkedin') || lowerMessage.includes('twitter')) {
      return this.knowledgeBase['social media'].response;
    }
    
    if (lowerMessage.includes('hubspot') || lowerMessage.includes('airtable') || lowerMessage.includes('crm')) {
      return `❌ **You don't need HubSpot or Airtable!**

Based on your workflow analysis, you don't have any CRM or database workflows. Your tax business is already well-automated with:

✅ **Microsoft Outlook** - Email automation
✅ **Google Sheets** - Data processing  
✅ **OpenAI** - Content generation
✅ **Webhooks** - External integrations
✅ **Scheduling** - Automation

**Focus on optimizing your existing tax-focused workflows rather than adding unnecessary CRM complexity.**`;
    }
    
    // Default response
    return this.knowledgeBase['default'].response;
  }

  public processMessage(message: string): string {
    return this.getResponse(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    console.log('🤖 Ben Chat Agent received message:', message);
    
    const chatAgent = new BenChatAgent();
    const response = chatAgent.processMessage(message);
    
    console.log('✅ Ben Chat Agent response generated');

    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Chat agent error:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process message',
      details: errorMessage
    }, { status: 500 });
  }
}
