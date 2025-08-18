import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';
import { withRBAC } from '@/lib/rbac';
import { withApiRateLimit } from '@/lib/rate-limiter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Get all reports
async function getReports(req: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const orgId = searchParams.get('orgId');

    const collection = getCollection(COLLECTIONS.reports);

    const query: unknown = {};
    if (type) {
      query.type = type;
    }
    if (orgId) {
      query.orgId = new ObjectId(orgId);
    }

    const reports = await collection.find(query).toArray();

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Create new report
async function createReport(req: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reportData = await req.json();

    // Validate required fields
    if (
      !reportData.name ||
      !reportData.type ||
      !reportData.metrics ||
      !reportData.visualization
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, type, metrics, visualization',
        },
        { status: 400 }
      );
    }

    const collection = getCollection(COLLECTIONS.reports);

    const report = {
      ...reportData,
      _id: new ObjectId(),
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(report);

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report created successfully',
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// Generate report
async function generateReport(req: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reportId, filters, visualization } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID required' },
        { status: 400 }
      );
    }

    // Get report definition
    const reportsCollection = getCollection(COLLECTIONS.reports);
    const report = await reportsCollection.findOne({
      _id: new ObjectId(reportId),
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate report data based on metrics and filters
    const reportData = await generateReportData(report, filters || []);

    return NextResponse.json({
      success: true,
      data: {
        report,
        data: reportData,
        visualization,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Helper function to generate report data
async function generateReportData(report: unknown, filters: unknown[]) {
  const { metrics, type } = report;

  // Mock data generation based on report type
  const mockData = {
    performance_overview: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Agent Execution Rate',
          data: [12, 19, 15, 25, 22, 30],
          borderColor: '#fe3d51',
          backgroundColor: 'rgba(254, 61, 81, 0.1)',
        },
        {
          label: 'Success Rate',
          data: [85, 88, 92, 87, 90, 94],
          borderColor: '#1eaef7',
          backgroundColor: 'rgba(30, 174, 247, 0.1)',
        },
      ],
    },
    system_health: {
      uptime: 99.8,
      responseTime: 245,
      errors: 0.2,
    },
    user_analytics: {
      labels: ['Active Users', 'New Users', 'Returning Users'],
      data: [1250, 340, 910],
      backgroundColor: ['#fe3d51', '#1eaef7', '#5ffbfd'],
    },
  };

  return (
    mockData[type as keyof typeof mockData] || mockData.performance_overview
  );
}

// Export with rate limiting and RBAC
export const GET = withApiRateLimit(
  withRBAC(getReports, { resource: 'analytics', action: 'read' })
);

export const POST = withApiRateLimit(
  withRBAC(createReport, { resource: 'analytics', action: 'create' })
);

// Generate report endpoint
export async function PUT(req: NextRequest) {
  return withApiRateLimit(
    withRBAC(generateReport, { resource: 'analytics', action: 'read' })
  )(req, {});
}
