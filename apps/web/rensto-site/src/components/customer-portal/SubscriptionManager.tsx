'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Zap, 
  Database, 
  Settings,
  ArrowUpRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SubscriptionData {
  planType: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  features: {
    interactions: number;
    templates: number;
    users: number;
    apiCalls: number;
    storage: number;
    integrations: number;
    aiFeatures?: boolean;
    analytics?: boolean;
    whiteLabel?: boolean;
    customIntegrations?: boolean;
    dedicatedSupport?: boolean;
  };
}

interface UsageData {
  interactions: number;
  templates: number;
  storage: number;
  apiCalls: number;
  dataProcessing: number;
  customIntegrations: number;
}

interface SubscriptionManagerProps {
  subscription: SubscriptionData;
  usage: UsageData;
  onUpgrade: (planType: 'professional' | 'enterprise') => void;
  onDowngrade: (planType: 'basic' | 'professional') => void;
  onCancel: () => void;
}

export default function SubscriptionManager({ 
  subscription, 
  usage, 
  onUpgrade, 
  onDowngrade, 
  onCancel 
}: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'professional' | 'enterprise'>('professional');

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: '$97',
      description: 'Perfect for small businesses getting started with automation',
      features: ['100 interactions/month', '5 templates', '1 user', '1,000 API calls', '1GB storage', '3 integrations', 'Email support']
    },
    professional: {
      name: 'Professional Plan',
      price: '$197',
      description: 'Advanced features for growing businesses',
      features: ['500 interactions/month', '20 templates', '5 users', '5,000 API calls', '10GB storage', '10 integrations', 'AI features', 'Analytics', 'Priority support']
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: '$497',
      description: 'Complete solution for large organizations',
      features: ['Unlimited interactions', 'Unlimited templates', 'Unlimited users', 'Unlimited API calls', 'Unlimited storage', 'Unlimited integrations', 'White-label', 'Custom integrations', 'Dedicated support']
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'past_due': return <AlertCircle className="w-4 h-4" />;
      case 'canceled': return <AlertCircle className="w-4 h-4" />;
      case 'trialing': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleUpgrade = async (planType: 'professional' | 'enterprise') => {
    setIsLoading(true);
    try {
      await onUpgrade(planType);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async (planType: 'basic' | 'professional') => {
    setIsLoading(true);
    try {
      await onDowngrade(planType);
    } catch (error) {
      console.error('Downgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel();
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Subscription
            </CardTitle>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusIcon(subscription.status)}
              <span className="ml-1 capitalize">{subscription.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold">{plans[subscription.planType].name}</h3>
              <p className="text-2xl font-bold text-primary">{plans[subscription.planType].price}/month</p>
              <p className="text-sm text-muted-foreground">{plans[subscription.planType].description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Period</p>
              <p className="font-medium">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {subscription.planType !== 'enterprise' && (
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              {subscription.planType !== 'basic' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleDowngrade(subscription.planType === 'enterprise' ? 'professional' : 'basic')}
                  disabled={isLoading}
                >
                  Downgrade
                </Button>
              )}
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Interactions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Interactions</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.interactions} / {subscription.features.interactions === -1 ? '∞' : subscription.features.interactions}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.interactions, subscription.features.interactions)} 
                className="h-2"
              />
            </div>

            {/* API Calls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">API Calls</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.apiCalls.toLocaleString()} / {subscription.features.apiCalls === -1 ? '∞' : subscription.features.apiCalls.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.apiCalls, subscription.features.apiCalls)} 
                className="h-2"
              />
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.storage.toFixed(1)}GB / {subscription.features.storage === -1 ? '∞' : `${subscription.features.storage}GB`}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.storage, subscription.features.storage)} 
                className="h-2"
              />
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Templates</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.templates} / {subscription.features.templates === -1 ? '∞' : subscription.features.templates}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.templates, subscription.features.templates)} 
                className="h-2"
              />
            </div>

            {/* Data Processing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data Processing</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.dataProcessing.toFixed(1)}GB
                </span>
              </div>
              <Progress 
                value={Math.min((usage.dataProcessing / 10) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Custom Integrations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Custom Integrations</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.customIntegrations}
                </span>
              </div>
              <Progress 
                value={Math.min((usage.customIntegrations / 5) * 100, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(plans).filter(([key]) => key !== subscription.planType).map(([key, plan]) => (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all ${
                    selectedPlan === key ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlan(key as 'professional' | 'enterprise')}
                >
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary">{plan.price}/month</p>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : `Upgrade to ${plans[selectedPlan].name}`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
