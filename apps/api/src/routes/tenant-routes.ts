import { Router } from 'express';
import { TenantController } from '../controllers/tenant-controller';
import { authMiddleware } from '../middleware/auth-middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit-middleware';

const router = Router();
const tenantController = new TenantController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(rateLimitMiddleware);

/**
 * @route GET /api/v1/tenants/:subdomain
 * @desc Get tenant information
 * @access Private
 */
router.get('/:subdomain', async (req, res) => {
  await tenantController.getTenant(req, res);
});

/**
 * @route PUT /api/v1/tenants/:subdomain
 * @desc Update tenant configuration
 * @access Private
 */
router.put('/:subdomain', async (req, res) => {
  await tenantController.updateTenant(req, res);
});

/**
 * @route GET /api/v1/tenants/:subdomain/analytics
 * @desc Get tenant usage analytics
 * @access Private
 */
router.get('/:subdomain/analytics', async (req, res) => {
  await tenantController.getUsageAnalytics(req, res);
});

/**
 * @route POST /api/v1/tenants/:subdomain/usage
 * @desc Track usage for billing
 * @access Private
 */
router.post('/:subdomain/usage', async (req, res) => {
  await tenantController.trackUsage(req, res);
});

/**
 * @route GET /api/v1/tenants/:subdomain/health
 * @desc Get tenant health score and recommendations
 * @access Private
 */
router.get('/:subdomain/health', async (req, res) => {
  await tenantController.getHealthScore(req, res);
});

/**
 * @route GET /api/v1/tenants/:subdomain/billing
 * @desc Get billing portal URL
 * @access Private
 */
router.get('/:subdomain/billing', async (req, res) => {
  await tenantController.getBillingPortal(req, res);
});

export default router;
