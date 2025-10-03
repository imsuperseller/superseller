import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { LeadGenerationService } from '../services/lead-generation-service';
import { InstantlyCRMService } from '../services/instantly-crm-service';
import { EnhancedBillingService } from '../services/enhanced-billing-service';
import { AnalyticsService } from '../services/analytics-service';

// Mock the services for testing
jest.mock('../services/lead-generation-service');
jest.mock('../services/instantly-crm-service');
jest.mock('../services/enhanced-billing-service');
jest.mock('../services/analytics-service');

describe('Lead Generation System Tests', () => {
  let leadGenerationService: jest.Mocked<LeadGenerationService>;
  let instantlyCRMService: jest.Mocked<InstantlyCRMService>;
  let enhancedBillingService: jest.Mocked<EnhancedBillingService>;
  let analyticsService: jest.Mocked<AnalyticsService>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mock instances
    leadGenerationService = new LeadGenerationService() as jest.Mocked<LeadGenerationService>;
    instantlyCRMService = new InstantlyCRMService() as jest.Mocked<InstantlyCRMService>;
    enhancedBillingService = new EnhancedBillingService() as jest.Mocked<EnhancedBillingService>;
    analyticsService = new AnalyticsService() as jest.Mocked<AnalyticsService>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Lead Generation Service', () => {
    it('should generate leads from multiple sources', async () => {
      const mockRequest = {
        customerId: 'test-customer-123',
        sources: ['linkedin', 'google_maps'],
        criteria: {
          industry: 'Technology',
          location: 'San Francisco',
          companySize: 'medium',
          keywords: ['software', 'startup']
        },
        quantity: 50,
        deliveryMethod: 'crm' as const
      };

      const mockResult = {
        success: true,
        leadsGenerated: 50,
        deliveryMethod: 'crm',
        deliveryResult: {
          method: 'crm',
          status: 'synced',
          leadsDelivered: 50
        },
        usage: {
          leadsGenerated: 50,
          apiCalls: 2,
          dataProcessing: 5
        }
      };

      leadGenerationService.generateLeads.mockResolvedValue(mockResult);

      const result = await leadGenerationService.generateLeads(mockRequest);

      expect(result.success).toBe(true);
      expect(result.leadsGenerated).toBe(50);
      expect(result.deliveryMethod).toBe('crm');
      expect(leadGenerationService.generateLeads).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle lead generation errors gracefully', async () => {
      const mockRequest = {
        customerId: 'test-customer-123',
        sources: ['invalid_source'],
        criteria: {
          industry: 'Technology',
          location: 'San Francisco'
        },
        quantity: 50,
        deliveryMethod: 'crm' as const
      };

      leadGenerationService.generateLeads.mockRejectedValue(new Error('Invalid source'));

      await expect(leadGenerationService.generateLeads(mockRequest)).rejects.toThrow('Invalid source');
    });
  });

  describe('Instantly.ai CRM Service', () => {
    it('should create contact successfully', async () => {
      const mockContactData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Company',
        title: 'CEO',
        phone: '+1234567890',
        location: 'San Francisco',
        source: 'linkedin',
        tags: ['lead', 'technology']
      };

      const mockResult = {
        success: true,
        contactId: 'contact-123',
        contact: mockContactData
      };

      instantlyCRMService.createContact.mockResolvedValue(mockResult);

      const result = await instantlyCRMService.createContact(mockContactData);

      expect(result.success).toBe(true);
      expect(result.contactId).toBe('contact-123');
      expect(instantlyCRMService.createContact).toHaveBeenCalledWith(mockContactData);
    });

    it('should create campaign successfully', async () => {
      const mockCampaignData = {
        name: 'Test Campaign',
        from_name: 'Rensto',
        from_email: 'leads@rensto.com',
        reply_to: 'leads@rensto.com',
        subject: 'Test Subject',
        html_content: '<h1>Test</h1>',
        text_content: 'Test'
      };

      const mockResult = {
        success: true,
        campaignId: 'campaign-123',
        campaign: mockCampaignData
      };

      instantlyCRMService.createCampaign.mockResolvedValue(mockResult);

      const result = await instantlyCRMService.createCampaign(mockCampaignData);

      expect(result.success).toBe(true);
      expect(result.campaignId).toBe('campaign-123');
      expect(instantlyCRMService.createCampaign).toHaveBeenCalledWith(mockCampaignData);
    });

    it('should add leads to campaign successfully', async () => {
      const campaignId = 'campaign-123';
      const mockLeads = [
        {
          email: 'lead1@example.com',
          first_name: 'Lead',
          last_name: 'One',
          company: 'Company One'
        },
        {
          email: 'lead2@example.com',
          first_name: 'Lead',
          last_name: 'Two',
          company: 'Company Two'
        }
      ];

      const mockResult = {
        success: true,
        addedCount: 2,
        failedCount: 0,
        leads: mockLeads
      };

      instantlyCRMService.addLeadsToCampaign.mockResolvedValue(mockResult);

      const result = await instantlyCRMService.addLeadsToCampaign(campaignId, mockLeads);

      expect(result.success).toBe(true);
      expect(result.addedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(instantlyCRMService.addLeadsToCampaign).toHaveBeenCalledWith(campaignId, mockLeads);
    });
  });

  describe('Enhanced Billing Service', () => {
    it('should create enhanced subscription successfully', async () => {
      const mockSubscriptionData = {
        customerId: 'test-customer-123',
        planType: 'professional' as const,
        paymentMethodId: 'pm_123'
      };

      const mockResult = {
        subscription: {
          id: 'sub_123',
          customerId: 'test-customer-123',
          planType: 'professional',
          status: 'active'
        },
        stripeSubscription: {
          id: 'sub_stripe_123',
          status: 'active'
        },
        clientSecret: 'pi_123_secret',
        usageTracking: {
          initialized: true,
          planLimits: {
            interactions: 500,
            apiCalls: 5000,
            storage: 10
          }
        }
      };

      enhancedBillingService.createEnhancedSubscription.mockResolvedValue(mockResult);

      const result = await enhancedBillingService.createEnhancedSubscription(
        mockSubscriptionData.customerId,
        mockSubscriptionData.planType,
        mockSubscriptionData.paymentMethodId
      );

      expect(result.subscription.planType).toBe('professional');
      expect(result.usageTracking.initialized).toBe(true);
      expect(enhancedBillingService.createEnhancedSubscription).toHaveBeenCalledWith(
        mockSubscriptionData.customerId,
        mockSubscriptionData.planType,
        mockSubscriptionData.paymentMethodId
      );
    });

    it('should track usage with billing successfully', async () => {
      const mockUsageData = {
        customerId: 'test-customer-123',
        usageData: {
          interactions: 10,
          apiCalls: 50,
          dataProcessing: 1,
          storage: 0.5,
          leadGeneration: 25,
          crmContacts: 25,
          emailCampaigns: 2
        }
      };

      const mockResult = {
        success: true,
        usageTracked: mockUsageData.usageData,
        overages: null,
        overageCost: 0,
        upgradeRecommendation: {
          recommended: false,
          utilization: {
            interactions: 2,
            apiCalls: 1,
            storage: 5
          }
        },
        currentUsage: mockUsageData.usageData
      };

      enhancedBillingService.trackUsageWithBilling.mockResolvedValue(mockResult);

      const result = await enhancedBillingService.trackUsageWithBilling(
        mockUsageData.customerId,
        mockUsageData.usageData
      );

      expect(result.success).toBe(true);
      expect(result.overages).toBeNull();
      expect(result.overageCost).toBe(0);
      expect(enhancedBillingService.trackUsageWithBilling).toHaveBeenCalledWith(
        mockUsageData.customerId,
        mockUsageData.usageData
      );
    });
  });

  describe('Analytics Service', () => {
    it('should get customer analytics successfully', async () => {
      const mockAnalytics = {
        success: true,
        customer: {
          id: 'test-customer-123',
          name: 'Test Customer',
          company: 'Test Company',
          subdomain: 'test-company'
        },
        period: '30d',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        metrics: {
          utilization: {
            interactions: 60,
            apiCalls: 40,
            storage: 20
          },
          overages: {
            interactions: 0,
            apiCalls: 0,
            storage: 0
          },
          efficiencyScore: 85,
          costAnalysis: {
            planPrice: 197,
            overageCost: 0,
            totalCost: 197
          }
        },
        trends: {
          trend: 'increasing',
          change: 15.5
        },
        recommendations: [
          {
            type: 'optimization',
            priority: 'medium',
            title: 'Optimize API Usage',
            description: 'Consider batching API calls to improve efficiency',
            action: 'optimize_api'
          }
        ]
      };

      analyticsService.getCustomerAnalytics.mockResolvedValue(mockAnalytics);

      const result = await analyticsService.getCustomerAnalytics('test-customer-123', '30d');

      expect(result.success).toBe(true);
      expect(result.customer.id).toBe('test-customer-123');
      expect(result.metrics.efficiencyScore).toBe(85);
      expect(result.recommendations).toHaveLength(1);
      expect(analyticsService.getCustomerAnalytics).toHaveBeenCalledWith('test-customer-123', '30d');
    });

    it('should get system analytics successfully', async () => {
      const mockSystemAnalytics = {
        success: true,
        period: '30d',
        systemMetrics: {
          totalCustomers: 150,
          avgUsagePerCustomer: {
            interactions: 200,
            apiCalls: 1000,
            dataProcessing: 5,
            storage: 2
          },
          growthRates: {
            interactions: 25,
            apiCalls: 30,
            dataProcessing: 20,
            storage: 15
          },
          systemHealth: {
            score: 92,
            status: 'healthy',
            recommendations: []
          }
        },
        topCustomers: [
          {
            customerId: 'customer-1',
            customerName: 'Top Customer',
            company: 'Top Company',
            totalUsage: 5000,
            breakdown: {
              interactions: 2000,
              apiCalls: 2500,
              dataProcessing: 500
            }
          }
        ],
        revenueAnalytics: {
          totalCustomers: 150,
          totalRevenue: 25000,
          revenueByPlan: {
            basic: { count: 100, revenue: 9700 },
            professional: { count: 40, revenue: 7880 },
            enterprise: { count: 10, revenue: 4970 }
          },
          averageRevenuePerCustomer: 166.67
        }
      };

      analyticsService.getSystemAnalytics.mockResolvedValue(mockSystemAnalytics);

      const result = await analyticsService.getSystemAnalytics('30d');

      expect(result.success).toBe(true);
      expect(result.systemMetrics.totalCustomers).toBe(150);
      expect(result.revenueAnalytics.totalRevenue).toBe(25000);
      expect(analyticsService.getSystemAnalytics).toHaveBeenCalledWith('30d');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full lead generation workflow', async () => {
      // Mock the full workflow
      const mockLeadGeneration = {
        success: true,
        leadsGenerated: 50,
        deliveryMethod: 'crm',
        deliveryResult: { method: 'crm', status: 'synced', leadsDelivered: 50 },
        usage: { leadsGenerated: 50, apiCalls: 2, dataProcessing: 5 }
      };

      const mockUsageTracking = {
        success: true,
        usageTracked: { leadGeneration: 50, apiCalls: 2, dataProcessing: 5 },
        overages: null,
        overageCost: 0,
        upgradeRecommendation: { recommended: false },
        currentUsage: { leadGeneration: 50, apiCalls: 2, dataProcessing: 5 }
      };

      const mockAnalytics = {
        success: true,
        metrics: { efficiencyScore: 85 },
        trends: { trend: 'increasing', change: 15.5 },
        recommendations: []
      };

      leadGenerationService.generateLeads.mockResolvedValue(mockLeadGeneration);
      enhancedBillingService.trackUsageWithBilling.mockResolvedValue(mockUsageTracking);
      analyticsService.getCustomerAnalytics.mockResolvedValue(mockAnalytics);

      // Execute the workflow
      const leadResult = await leadGenerationService.generateLeads({
        customerId: 'test-customer',
        sources: ['linkedin'],
        criteria: { industry: 'Technology' },
        quantity: 50,
        deliveryMethod: 'crm'
      });

      const usageResult = await enhancedBillingService.trackUsageWithBilling('test-customer', {
        leadGeneration: 50,
        apiCalls: 2,
        dataProcessing: 5
      });

      const analyticsResult = await analyticsService.getCustomerAnalytics('test-customer', '30d');

      // Verify the complete workflow
      expect(leadResult.success).toBe(true);
      expect(leadResult.leadsGenerated).toBe(50);
      expect(usageResult.success).toBe(true);
      expect(analyticsResult.success).toBe(true);
      expect(analyticsResult.metrics.efficiencyScore).toBe(85);
    });
  });
});
