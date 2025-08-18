import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BEN_N8N_CONFIG = {
  url: 'https://tax4usllc.app.n8n.cloud',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
};

// Define the 4 essential agents and their required credentials
const ESSENTIAL_AGENTS = {
  'blog-agent': {
    name: 'Blog Agent - Tax4Us',
    description: 'Generates and publishes blog content',
    required_credentials: [
      {
        name: 'openai-api',
        type: 'openAiApi',
        description: 'OpenAI API for content generation',
        required: true
      },
      {
        name: 'wordpress-api',
        type: 'wordpressApi',
        description: 'WordPress API for publishing',
        required: true
      }
    ],
    optional_credentials: [
      {
        name: 'google-drive',
        type: 'googleDriveOAuth2Api',
        description: 'Google Drive for document storage',
        required: false
      }
    ]
  },
  'content-agent': {
    name: 'WordPress Content Agent - Tax4Us (Complete)',
    description: 'Manages website content and updates',
    required_credentials: [
      {
        name: 'wordpress-api',
        type: 'wordpressApi',
        description: 'WordPress API for content management',
        required: true
      },
      {
        name: 'openai-api',
        type: 'openAiApi',
        description: 'OpenAI API for content generation',
        required: true
      }
    ],
    optional_credentials: [
      {
        name: 'google-drive',
        type: 'googleDriveOAuth2Api',
        description: 'Google Drive for media storage',
        required: false
      }
    ]
  },
  'social-agent': {
    name: 'Social Media Agent - Tax4Us',
    description: 'Manages social media content and scheduling',
    required_credentials: [
      {
        name: 'openai-api',
        type: 'openAiApi',
        description: 'OpenAI API for content generation',
        required: true
      }
    ],
    optional_credentials: [
      {
        name: 'facebook-api',
        type: 'facebookApi',
        description: 'Facebook API for posting',
        required: false
      },
      {
        name: 'linkedin-api',
        type: 'linkedInApi',
        description: 'LinkedIn API for posting',
        required: false
      },
      {
        name: 'twitter-api',
        type: 'twitterApi',
        description: 'Twitter API for posting',
        required: false
      }
    ]
  },
  'podcast-agent': {
    name: 'Podcast Agent - Tax4Us',
    description: 'Generates podcast scripts and content',
    required_credentials: [
      {
        name: 'openai-api',
        type: 'openAiApi',
        description: 'OpenAI API for script generation',
        required: true
      }
    ],
    optional_credentials: [
      {
        name: 'google-drive',
        type: 'googleDriveOAuth2Api',
        description: 'Google Drive for script storage',
        required: false
      },
      {
        name: 'spotify-api',
        type: 'spotifyApi',
        description: 'Spotify API for podcast management',
        required: false
      }
    ]
  }
};

export async function GET() {
  try {
    console.log('🔍 Getting Ben\'s agent credential requirements...');
    
    // Get current workflows to check which agents are active
    const workflowsResponse = await axios.get(`${BEN_N8N_CONFIG.url}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': BEN_N8N_CONFIG.apiKey }
    });

    const workflows = workflowsResponse.data.data || [];
    const activeWorkflows = workflows.filter((w: { active: boolean }) => w.active);

    // Map active workflows to agents
    const activeAgents = Object.keys(ESSENTIAL_AGENTS).filter(agentKey => {
      const agent = ESSENTIAL_AGENTS[agentKey as keyof typeof ESSENTIAL_AGENTS];
      return activeWorkflows.some(workflow => workflow.name.includes(agent.name));
    });

    // Build credential requirements
    const allRequiredCredentials = new Map();
    const allOptionalCredentials = new Map();

    activeAgents.forEach(agentKey => {
      const agent = ESSENTIAL_AGENTS[agentKey as keyof typeof ESSENTIAL_AGENTS];
      
      // Add required credentials
      agent.required_credentials.forEach(cred => {
        if (!allRequiredCredentials.has(cred.name)) {
          allRequiredCredentials.set(cred.name, {
            ...cred,
            agents: [agent.name]
          });
        } else {
          allRequiredCredentials.get(cred.name).agents.push(agent.name);
        }
      });

      // Add optional credentials
      agent.optional_credentials.forEach(cred => {
        if (!allOptionalCredentials.has(cred.name)) {
          allOptionalCredentials.set(cred.name, {
            ...cred,
            agents: [agent.name]
          });
        } else {
          allOptionalCredentials.get(cred.name).agents.push(agent.name);
        }
      });
    });

    const response = {
      success: true,
      active_agents: activeAgents.map(key => ESSENTIAL_AGENTS[key as keyof typeof ESSENTIAL_AGENTS]),
      required_credentials: Array.from(allRequiredCredentials.values()),
      optional_credentials: Array.from(allOptionalCredentials.values()),
      total_required: allRequiredCredentials.size,
      total_optional: allOptionalCredentials.size
    };

    console.log(`✅ Found ${activeAgents.length} active agents with credential requirements`);

    return NextResponse.json(response);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get credential requirements:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get credential requirements',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agentKey, credentialData } = await request.json();
    
    if (!agentKey || !credentialData) {
      return NextResponse.json({
        success: false,
        error: 'Agent key and credential data are required'
      }, { status: 400 });
    }

    console.log(`🔐 Setting up credentials for agent: ${agentKey}`);

    const agent = ESSENTIAL_AGENTS[agentKey as keyof typeof ESSENTIAL_AGENTS];
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Invalid agent key'
      }, { status: 400 });
    }

    // Since n8n Cloud doesn't allow API credential management,
    // we'll provide step-by-step instructions
    const setupInstructions = {
      agent: agent.name,
      description: agent.description,
      required_credentials: agent.required_credentials.map(cred => ({
        name: cred.name,
        type: cred.type,
        description: cred.description,
        setup_steps: generateSetupSteps(cred.type, cred.name)
      })),
      optional_credentials: agent.optional_credentials.map(cred => ({
        name: cred.name,
        type: cred.type,
        description: cred.description,
        setup_steps: generateSetupSteps(cred.type, cred.name)
      }))
    };

    console.log(`✅ Generated setup instructions for ${agent.name}`);

    return NextResponse.json({
      success: true,
      message: 'Credential setup instructions generated',
      instructions: setupInstructions,
      n8n_cloud_url: BEN_N8N_CONFIG.url
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to generate credential instructions:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate credential instructions',
      details: errorMessage
    }, { status: 500 });
  }
}

function generateSetupSteps(credentialType: string, credentialName: string): string[] {
  const baseSteps = [
    `Go to your n8n Cloud instance: ${BEN_N8N_CONFIG.url}`,
    'Navigate to Settings → Credentials',
    'Click "Add Credential"'
  ];

  switch (credentialType) {
    case 'openAiApi':
      return [
        ...baseSteps,
        'Select "OpenAI" from the list',
        'Choose "OpenAI API"',
        'Click "Create"',
        'Enter your OpenAI API key (get it from https://platform.openai.com/api-keys)',
        'Save the credential with a descriptive name (e.g., "Tax4US OpenAI")',
        'Test the connection to ensure it works'
      ];

    case 'wordpressApi':
      return [
        ...baseSteps,
        'Select "WordPress" from the list',
        'Choose "WordPress API"',
        'Click "Create"',
        'Enter your WordPress site URL',
        'Enter your WordPress username and password or application password',
        'Save the credential with a descriptive name (e.g., "Tax4US WordPress")',
        'Test the connection to ensure it works'
      ];

    case 'googleDriveOAuth2Api':
      return [
        ...baseSteps,
        'Select "Google Drive" from the list',
        'Choose "Google Drive OAuth2 API"',
        'Click "Create"',
        'Follow the OAuth2 flow to authorize n8n',
        'Grant necessary permissions for file access',
        'Save the credential with a descriptive name (e.g., "Tax4US Google Drive")',
        'Test the connection to ensure it works'
      ];

    case 'facebookApi':
      return [
        ...baseSteps,
        'Select "Facebook" from the list',
        'Choose "Facebook API"',
        'Click "Create"',
        'Follow the OAuth2 flow to authorize n8n',
        'Grant necessary permissions for posting',
        'Save the credential with a descriptive name (e.g., "Tax4US Facebook")',
        'Test the connection to ensure it works'
      ];

    case 'linkedInApi':
      return [
        ...baseSteps,
        'Select "LinkedIn" from the list',
        'Choose "LinkedIn API"',
        'Click "Create"',
        'Follow the OAuth2 flow to authorize n8n',
        'Grant necessary permissions for posting',
        'Save the credential with a descriptive name (e.g., "Tax4US LinkedIn")',
        'Test the connection to ensure it works'
      ];

    case 'twitterApi':
      return [
        ...baseSteps,
        'Select "Twitter" from the list',
        'Choose "Twitter API"',
        'Click "Create"',
        'Enter your Twitter API credentials (API Key, API Secret, Access Token, Access Token Secret)',
        'Save the credential with a descriptive name (e.g., "Tax4US Twitter")',
        'Test the connection to ensure it works'
      ];

    default:
      return [
        ...baseSteps,
        `Select "${credentialType}" from the list`,
        'Follow the setup instructions for the specific service',
        'Save the credential with a descriptive name',
        'Test the connection to ensure it works'
      ];
  }
}
