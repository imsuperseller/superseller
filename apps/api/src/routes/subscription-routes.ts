import { Router } from 'express';
import { SubscriptionService } from '../services/subscription-service';
import { authMiddleware } from '../middleware/auth-middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit-middleware';

const router = Router();
const subscriptionService = new SubscriptionService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(rateLimitMiddleware);

/**
 * @route POST /api/v1/subscriptions
 * @desc Create a new subscription
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { customerId, planType, paymentMethodId } = req.body;
    
    if (!customerId || !planType) {
      return res.status(400).json({ error: 'Customer ID and plan type are required' });
    }

    const result = await subscriptionService.createSubscription(customerId, planType, paymentMethodId);
    res.json(result);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route PUT /api/v1/subscriptions/:subscriptionId
 * @desc Update subscription plan
 * @access Private
 */
router.put('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { planType } = req.body;
    
    if (!planType) {
      return res.status(400).json({ error: 'Plan type is required' });
    }

    const result = await subscriptionService.updateSubscription(subscriptionId, planType);
    res.json(result);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/v1/subscriptions/:subscriptionId
 * @desc Cancel subscription
 * @access Private
 */
router.delete('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediately = false } = req.body;

    const result = await subscriptionService.cancelSubscription(subscriptionId, immediately);
    res.json(result);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/v1/subscriptions/:customerId
 * @desc Get subscription details
 * @access Private
 */
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const subscription = await subscriptionService.getSubscription(customerId);
    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/v1/subscriptions/usage
 * @desc Track usage for billing
 * @access Private
 */
router.post('/usage', async (req, res) => {
  try {
    const { customerId, usageType, amount } = req.body;
    
    if (!customerId || !usageType || amount === undefined) {
      return res.status(400).json({ error: 'Customer ID, usage type, and amount are required' });
    }

    const result = await subscriptionService.trackUsage(customerId, usageType, amount);
    res.json(result);
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/v1/subscriptions/:customerId/billing
 * @desc Get billing portal URL
 * @access Private
 */
router.get('/:customerId/billing', async (req, res) => {
  try {
    const { customerId } = req.params;

    const billingUrl = await subscriptionService.getBillingPortalUrl(customerId);
    res.json({ billingUrl });
  } catch (error) {
    console.error('Error getting billing portal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/v1/subscriptions/webhook
 * @desc Handle Stripe webhook events
 * @access Public (Stripe webhook)
 */
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    const result = await subscriptionService.handleWebhook(event);
    res.json(result);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
