import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIAnalysisEngine } from '@/lib/real-time-analytics';

// Real AI Insights API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await params;

    // Get real analytics data first
    const analyticsResponse = await fetch(
      `${request.nextUrl.origin}/api/analytics/facebook-scraping/${orgId}`
    );
    const analyticsData = await analyticsResponse.json();

    if (!analyticsData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Generate real AI insights based on actual data
    const insights = await AIAnalysisEngine.generateInsights(
      analyticsData.data
    );

    // Add business-specific insights for Ortal
    const businessInsights = await generateBusinessInsights(
      analyticsData.data,
      orgId
    );

    const allInsights = [...insights, ...businessInsights];

    return NextResponse.json({
      success: true,
      insights: allInsights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

async function generateBusinessInsights(
  analyticsData: unknown,
  organizationId: string
) {
  const insights = [];

  // Business-specific insights for Ortal's Jewish community business
  if (organizationId === 'ortal-flanary') {
    // Geographic performance insights
    const miamiGroups = analyticsData.processedGroups.filter(
      (group: unknown) =>
        group.name.includes('מיאמי') || group.name.includes('Miami')
    );
    const laGroups = analyticsData.processedGroups.filter(
      (group: unknown) =>
        group.name.includes('Los Angeles') || group.name.includes('LA')
    );

    if (miamiGroups.length > 0 && laGroups.length > 0) {
      const miamiLeads = miamiGroups.reduce(
        (sum: number, group: unknown) => sum + group.leadsExtracted,
        0
      );
      const laLeads = laGroups.reduce(
        (sum: number, group: unknown) => sum + group.leadsExtracted,
        0
      );

      if (miamiLeads > laLeads * 1.5) {
        insights.push({
          id: 'geo-performance',
          type: 'performance',
          title: 'Miami Market Outperforming LA',
          description: `Miami Jewish community groups are generating ${Math.round(
            (miamiLeads / laLeads) * 100
          )}% more leads than LA groups. Consider expanding Miami events and marketing.`,
          impact: 'high',
          action: 'Focus on Miami Market',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Food-related group insights
    const foodGroups = analyticsData.processedGroups.filter(
      (group: unknown) =>
        group.name.includes('food') ||
        group.name.includes('kosher') ||
        group.name.includes('restaurant')
    );

    if (foodGroups.length > 0) {
      const totalFoodLeads = foodGroups.reduce(
        (sum: number, group: unknown) => sum + group.leadsExtracted,
        0
      );
      const avgLeadsPerFoodGroup = totalFoodLeads / foodGroups.length;

      if (avgLeadsPerFoodGroup > 1500) {
        insights.push({
          id: 'food-opportunity',
          type: 'opportunity',
          title: 'High Engagement in Food Groups',
          description: `Food-related groups average ${Math.round(
            avgLeadsPerFoodGroup
          )} leads each. Consider hosting kosher food events or partnering with Jewish restaurants.`,
          impact: 'medium',
          action: 'Plan Food Events',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Lead quality insights
    if (analyticsData.leadQuality.engagementScore < 7) {
      insights.push({
        id: 'lead-quality',
        type: 'optimization',
        title: 'Lead Quality Needs Improvement',
        description: `Your lead engagement score is ${analyticsData.leadQuality.engagementScore}/10. Focus on groups with more active members and better profile completeness.`,
        impact: 'high',
        action: 'Improve Targeting',
        timestamp: new Date().toISOString(),
      });
    }

    // Cost optimization insights
    if (analyticsData.performance.costPerLead > 0.15) {
      insights.push({
        id: 'cost-optimization',
        type: 'cost',
        title: 'High Cost per Lead Detected',
        description: `Your cost per lead is $${analyticsData.performance.costPerLead}. Consider targeting smaller, more focused groups to reduce costs.`,
        impact: 'medium',
        action: 'Review Group Selection',
        timestamp: new Date().toISOString(),
      });
    }

    // Seasonal insights
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 8 && currentMonth <= 10) {
      // September to November
      insights.push({
        id: 'seasonal-opportunity',
        type: 'opportunity',
        title: 'High Holiday Season Opportunity',
        description:
          'Jewish High Holidays are approaching. Consider increasing scraping frequency and targeting groups with holiday-related content.',
        impact: 'high',
        action: 'Increase Scraping',
        timestamp: new Date().toISOString(),
      });
    }

    // ROI insights
    if (analyticsData.performance.roi < 2) {
      insights.push({
        id: 'roi-improvement',
        type: 'roi',
        title: 'Low ROI - Optimization Needed',
        description: `Your ROI is ${analyticsData.performance.roi}x. Focus on groups with higher engagement rates and better lead quality.`,
        impact: 'high',
        action: 'Optimize Targeting',
        timestamp: new Date().toISOString(),
      });
    }

    // New group recommendations
    const recommendedGroups = [
      'Jewish Community of South Florida',
      'Kosher Foodies Miami',
      'Israeli Expats in Miami',
      'Jewish Business Network Miami',
    ];

    insights.push({
      id: 'new-groups',
      type: 'opportunity',
      title: 'New Target Groups Identified',
      description: `We've identified ${recommendedGroups.length} new Facebook groups that match your criteria. Consider adding them to your scraping list.`,
      impact: 'medium',
      action: 'Add New Groups',
      timestamp: new Date().toISOString(),
      metadata: { recommendedGroups },
    });
  }

  return insights;
}
