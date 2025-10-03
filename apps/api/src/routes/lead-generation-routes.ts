import { Router } from 'express';
import { LeadGenerationService } from '../services/lead-generation-service';
import { InstantlyCRMService } from '../services/instantly-crm-service';
import { EnhancedBillingService } from '../services/enhanced-billing-service';
import { AnalyticsService } from '../services/analytics-service';

const router = Router();
const leadGenerationService = new LeadGenerationService();
const instantlyCRMService = new InstantlyCRMService();
const enhancedBillingService = new EnhancedBillingService();
const analyticsService = new AnalyticsService();

/**
 * Generate leads with automated delivery
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      customerId,
      sources,
      criteria,
      quantity,
      deliveryMethod
    } = req.body;

    // Validate required fields
    if (!customerId || !sources || !criteria || !quantity || !deliveryMethod) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerId', 'sources', 'criteria', 'quantity', 'deliveryMethod']
      });
    }

    // Generate leads
    const result = await leadGenerationService.generateLeads({
      customerId,
      sources,
      criteria,
      quantity,
      deliveryMethod
    });

    res.json(result);

  } catch (error) {
    console.error('Error generating leads:', error);
    res.status(500).json({
      error: 'Failed to generate leads',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get lead generation analytics
 */
router.get('/analytics/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getCustomerAnalytics(
      customerId, 
      period as '7d' | '30d' | '90d' | '1y'
    );

    res.json(analytics);

  } catch (error) {
    console.error('Error getting lead generation analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create instantly.ai campaign
 */
router.post('/campaigns/create', async (req, res) => {
  try {
    const {
      name,
      from_name,
      from_email,
      reply_to,
      subject,
      html_content,
      text_content,
      schedule_time,
      timezone
    } = req.body;

    const result = await instantlyCRMService.createCampaign({
      name,
      from_name,
      from_email,
      reply_to,
      subject,
      html_content,
      text_content,
      schedule_time,
      timezone
    });

    res.json(result);

  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Add leads to campaign
 */
router.post('/campaigns/:campaignId/leads', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { leads } = req.body;

    const result = await instantlyCRMService.addLeadsToCampaign(campaignId, leads);

    res.json(result);

  } catch (error) {
    console.error('Error adding leads to campaign:', error);
    res.status(500).json({
      error: 'Failed to add leads to campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Start campaign
 */
router.post('/campaigns/:campaignId/start', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const result = await instantlyCRMService.startCampaign(campaignId);

    res.json(result);

  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({
      error: 'Failed to start campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get campaign status
 */
router.get('/campaigns/:campaignId/status', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const result = await instantlyCRMService.getCampaignStatus(campaignId);

    res.json(result);

  } catch (error) {
    console.error('Error getting campaign status:', error);
    res.status(500).json({
      error: 'Failed to get campaign status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get campaign analytics
 */
router.get('/campaigns/:campaignId/analytics', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { start_date, end_date } = req.query;

    const result = await instantlyCRMService.getCampaignAnalytics(campaignId, {
      start_date: start_date as string,
      end_date: end_date as string
    });

    res.json(result);

  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    res.status(500).json({
      error: 'Failed to get campaign analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create instantly.ai sequence
 */
router.post('/sequences/create', async (req, res) => {
  try {
    const { name, steps } = req.body;

    const result = await instantlyCRMService.createSequence({
      name,
      steps
    });

    res.json(result);

  } catch (error) {
    console.error('Error creating sequence:', error);
    res.status(500).json({
      error: 'Failed to create sequence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Add contacts to sequence
 */
router.post('/sequences/:sequenceId/contacts', async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const { contacts } = req.body;

    const result = await instantlyCRMService.addContactsToSequence(sequenceId, contacts);

    res.json(result);

  } catch (error) {
    console.error('Error adding contacts to sequence:', error);
    res.status(500).json({
      error: 'Failed to add contacts to sequence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get sequence analytics
 */
router.get('/sequences/:sequenceId/analytics', async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const { start_date, end_date } = req.query;

    const result = await instantlyCRMService.getSequenceAnalytics(sequenceId, {
      start_date: start_date as string,
      end_date: end_date as string
    });

    res.json(result);

  } catch (error) {
    console.error('Error getting sequence analytics:', error);
    res.status(500).json({
      error: 'Failed to get sequence analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create contact in instantly.ai
 */
router.post('/contacts/create', async (req, res) => {
  try {
    const contactData = req.body;

    const result = await instantlyCRMService.createContact(contactData);

    res.json(result);

  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create multiple contacts in batch
 */
router.post('/contacts/create-batch', async (req, res) => {
  try {
    const { contacts } = req.body;

    const result = await instantlyCRMService.createContactsBatch(contacts);

    res.json(result);

  } catch (error) {
    console.error('Error creating contacts batch:', error);
    res.status(500).json({
      error: 'Failed to create contacts batch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search contacts
 */
router.get('/contacts/search', async (req, res) => {
  try {
    const searchParams = req.query;

    const result = await instantlyCRMService.searchContacts(searchParams as any);

    res.json(result);

  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({
      error: 'Failed to search contacts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get account information
 */
router.get('/account/info', async (req, res) => {
  try {
    const result = await instantlyCRMService.getAccountInfo();

    res.json(result);

  } catch (error) {
    console.error('Error getting account info:', error);
    res.status(500).json({
      error: 'Failed to get account info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get account usage
 */
router.get('/account/usage', async (req, res) => {
  try {
    const result = await instantlyCRMService.getAccountUsage();

    res.json(result);

  } catch (error) {
    console.error('Error getting account usage:', error);
    res.status(500).json({
      error: 'Failed to get account usage',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Track usage with billing
 */
router.post('/usage/track', async (req, res) => {
  try {
    const { customerId, usageData } = req.body;

    if (!customerId || !usageData) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerId', 'usageData']
      });
    }

    const result = await enhancedBillingService.trackUsageWithBilling(customerId, usageData);

    res.json(result);

  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({
      error: 'Failed to track usage',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create enhanced subscription
 */
router.post('/subscriptions/create', async (req, res) => {
  try {
    const { customerId, planType, paymentMethodId } = req.body;

    if (!customerId || !planType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerId', 'planType']
      });
    }

    const result = await enhancedBillingService.createEnhancedSubscription(
      customerId, 
      planType, 
      paymentMethodId
    );

    res.json(result);

  } catch (error) {
    console.error('Error creating enhanced subscription:', error);
    res.status(500).json({
      error: 'Failed to create enhanced subscription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get system analytics
 */
router.get('/analytics/system', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getSystemAnalytics(
      period as '7d' | '30d' | '90d' | '1y'
    );

    res.json(analytics);

  } catch (error) {
    console.error('Error getting system analytics:', error);
    res.status(500).json({
      error: 'Failed to get system analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
