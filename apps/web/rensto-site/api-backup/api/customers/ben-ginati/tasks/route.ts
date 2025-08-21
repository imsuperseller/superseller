import { NextRequest, NextResponse } from 'next/server';

// Ben's specific tasks based on his current situation
const BEN_TASKS = [
  {
    id: 'captivate-api-access',
    title: 'Get Captivate API Access',
    description: 'Contact Captivate support to enable API access for podcast automation',
    type: 'api_setup' as const,
    status: 'blocked' as const,
    priority: 'urgent' as const,
    customerId: 'ben-ginati',
    estimatedTime: '1-2 business days',
    steps: [
      {
        id: 'email-captivate',
        title: 'Email Captivate Support',
        description: 'Send email to api@captivate.fm requesting API access',
        status: 'pending' as const,
        actionUrl: 'mailto:api@captivate.fm?subject=API Access Request for User ID: 655c0354-dec7-4e77-ade1-c79898c596cb',
        actionText: 'Send Email'
      },
      {
        id: 'include-details',
        title: 'Include Required Details',
        description: 'Provide User ID and API Key in the email',
        status: 'pending' as const
      },
      {
        id: 'wait-approval',
        title: 'Wait for API Access Approval',
        description: 'Captivate will review and grant API access',
        status: 'pending' as const
      }
    ],
    helpResources: [
      {
        type: 'email' as const,
        title: 'Contact Captivate Support',
        url: 'mailto:api@captivate.fm',
        description: 'Direct email to Captivate API support'
      },
      {
        type: 'documentation' as const,
        title: 'Captivate API Documentation',
        url: 'https://docs.captivate.fm',
        description: 'Official Captivate API documentation'
      }
    ]
  },
  {
    id: 'create-podcast',
    title: 'Create Your First Podcast',
    description: 'Set up your podcast in Captivate with proper configuration',
    type: 'onboarding' as const,
    status: 'pending' as const,
    priority: 'high' as const,
    customerId: 'ben-ginati',
    dependencies: ['captivate-api-access'],
    estimatedTime: '15 minutes',
    steps: [
      {
        id: 'access-captivate',
        title: 'Access Captivate Dashboard',
        description: 'Log into your Captivate account at captivate.fm',
        status: 'pending' as const,
        actionUrl: 'https://app.captivate.fm',
        actionText: 'Go to Captivate'
      },
      {
        id: 'create-new-podcast',
        title: 'Create New Podcast',
        description: 'Click "Create New Podcast" and fill in the required details',
        status: 'pending' as const
      },
      {
        id: 'fill-podcast-details',
        title: 'Fill Podcast Details',
        description: 'Complete the podcast setup form with Tax4Us information',
        status: 'pending' as const,
        actionUrl: '/portal/ben-ginati/podcast-setup',
        actionText: 'View Setup Form'
      },
      {
        id: 'configure-settings',
        title: 'Configure Podcast Settings',
        description: 'Set up RSS feed, categories, and distribution settings',
        status: 'pending' as const
      }
    ],
    helpResources: [
      {
        type: 'documentation' as const,
        title: 'Getting Started with Captivate',
        url: 'https://help.captivate.fm/en/category/getting-started-with-captivate-fm-podcast-hosting/',
        description: 'Complete guide to setting up your first podcast'
      },
      {
        type: 'chat' as const,
        title: 'Get AI Assistant Help',
        description: 'Ask our AI assistant for step-by-step guidance'
      }
    ]
  },
  {
    id: 'install-captivate-sync',
    title: 'Install Captivate Sync WordPress Plugin',
    description: 'Connect your WordPress site to Captivate for seamless podcast publishing',
    type: 'integration' as const,
    status: 'pending' as const,
    priority: 'high' as const,
    customerId: 'ben-ginati',
    dependencies: ['create-podcast'],
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 'download-plugin',
        title: 'Download Captivate Sync Plugin',
        description: 'Get the plugin from Captivate dashboard or WordPress repository',
        status: 'pending' as const,
        actionUrl: 'https://wordpress.org/plugins/captivate-sync/',
        actionText: 'Download Plugin'
      },
      {
        id: 'install-wordpress',
        title: 'Install in WordPress',
        description: 'Upload and activate the plugin in your WordPress admin',
        status: 'pending' as const
      },
      {
        id: 'authenticate-plugin',
        title: 'Authenticate Plugin',
        description: 'Connect the plugin to your Captivate account using your unique key',
        status: 'pending' as const
      },
      {
        id: 'sync-podcasts',
        title: 'Sync Podcasts',
        description: 'Select which podcasts to sync to your WordPress site',
        status: 'pending' as const
      }
    ],
    helpResources: [
      {
        type: 'documentation' as const,
        title: 'Captivate Sync Plugin Guide',
        url: 'https://help.captivate.fm/en/category/working-with-captivate-sync-dag5f2/',
        description: 'Complete guide to installing and using Captivate Sync'
      },
      {
        type: 'video' as const,
        title: 'Captivate Sync Tutorial',
        url: 'https://help.captivate.fm/en/category/working-with-captivate-sync-dag5f2/',
        description: 'Video tutorial on setting up Captivate Sync'
      }
    ]
  },
  {
    id: 'apple-podcasts-setup',
    title: 'Connect Apple Podcasts',
    description: 'Set up Apple Podcasts integration for distribution',
    type: 'integration' as const,
    status: 'pending' as const,
    priority: 'high' as const,
    customerId: 'ben-ginati',
    dependencies: ['create-podcast'],
    estimatedTime: '30 minutes',
    steps: [
      {
        id: 'get-rss-feed',
        title: 'Get RSS Feed URL',
        description: 'Copy your podcast RSS feed URL from Captivate dashboard',
        status: 'pending' as const
      },
      {
        id: 'apple-podcasts-connect',
        title: 'Access Apple Podcasts Connect',
        description: 'Log into Apple Podcasts Connect with your Apple Developer account',
        status: 'pending' as const,
        actionUrl: 'https://podcastsconnect.apple.com',
        actionText: 'Go to Apple Podcasts Connect'
      },
      {
        id: 'submit-podcast',
        title: 'Submit Podcast',
        description: 'Submit your RSS feed to Apple Podcasts for review',
        status: 'pending' as const
      },
      {
        id: 'wait-approval',
        title: 'Wait for Apple Approval',
        description: 'Apple will review and approve your podcast (1-3 business days)',
        status: 'pending' as const
      }
    ],
    helpResources: [
      {
        type: 'documentation' as const,
        title: 'Apple Podcasts Distribution',
        url: 'https://help.captivate.fm/en/category/podcast-distribution/',
        description: 'Guide to distributing your podcast to Apple Podcasts'
      },
      {
        type: 'chat' as const,
        title: 'Get AI Assistant Help',
        description: 'Ask our AI assistant for step-by-step guidance'
      }
    ]
  },
  {
    id: 'second-payment',
    title: 'Complete Second Payment',
    description: 'Process the remaining $2,500 payment for full automation',
    type: 'payment' as const,
    status: 'pending' as const,
    priority: 'high' as const,
    customerId: 'ben-ginati',
    dueDate: '2025-03-20',
    estimatedTime: '5 minutes',
    steps: [
      {
        id: 'review-invoice',
        title: 'Review Invoice',
        description: 'Check the invoice for the second payment',
        status: 'pending' as const,
        actionUrl: '/portal/ben-ginati/billing',
        actionText: 'View Invoice'
      },
      {
        id: 'process-payment',
        title: 'Process Payment',
        description: 'Complete the $2,500 payment',
        status: 'pending' as const,
        actionUrl: '/portal/ben-ginati/billing/pay',
        actionText: 'Pay Now'
      }
    ],
    helpResources: [
      {
        type: 'chat' as const,
        title: 'Payment Support',
        description: 'Get help with payment processing'
      }
    ]
  },
  {
    id: 'wordpress-credentials',
    title: 'Verify WordPress Credentials',
    description: 'Ensure WordPress integration is working properly',
    type: 'credentials' as const,
    status: 'completed' as const,
    priority: 'medium' as const,
    customerId: 'ben-ginati',
    estimatedTime: '10 minutes',
    steps: [
      {
        id: 'test-login',
        title: 'Test WordPress Login',
        description: 'Verify credentials work with tax4us.co.il',
        status: 'completed' as const
      },
      {
        id: 'check-permissions',
        title: 'Check API Permissions',
        description: 'Ensure WordPress API access is enabled',
        status: 'completed' as const
      }
    ],
    helpResources: []
  }
];

export async function GET() {
  try {
    console.log('📋 Fetching Ben\'s tasks...');

    return NextResponse.json({
      success: true,
      tasks: BEN_TASKS,
      total: BEN_TASKS.length,
      completed: BEN_TASKS.filter(t => t.status === 'completed').length,
      pending: BEN_TASKS.filter(t => t.status === 'pending').length,
      blocked: BEN_TASKS.filter(t => t.status === 'blocked').length,
      urgent: BEN_TASKS.filter(t => t.priority === 'urgent').length
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to fetch Ben\'s tasks:', errorMessage);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tasks',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { taskId, status } = await request.json();

    console.log(`🔄 Updating task ${taskId} to status: ${status}`);

    // In a real implementation, this would update the database
    // For now, we'll just return success
    const updatedTask = BEN_TASKS.find(task => task.id === taskId);

    if (!updatedTask) {
      return NextResponse.json({
        success: false,
        error: 'Task not found'
      }, { status: 404 });
    }

    // Update the task status
    updatedTask.status = status;

    // Update step statuses based on task status
    if (status === 'completed') {
      updatedTask.steps.forEach(step => {
        step.status = 'completed';
      });
    } else if (status === 'in_progress') {
      // Mark first step as completed when starting
      if (updatedTask.steps.length > 0) {
        updatedTask.steps[0].status = 'completed';
      }
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: `Task ${taskId} updated to ${status}`
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to update task:', errorMessage);

    return NextResponse.json({
      success: false,
      error: 'Failed to update task',
      details: errorMessage
    }, { status: 500 });
  }
}
