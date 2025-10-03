import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔄 SYNC HEALTH API ENDPOINT
 * 
 * Handles real-time sync health monitoring and conflict detection
 * for the Smart Sync System integration with admin dashboard.
 */

interface SyncHealthData {
  section: string;
  data: any;
  timestamp: string;
}

interface SyncAlert {
  system: string;
  conflictCount: number;
  conflicts: any[];
  timestamp: string;
}

interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  lastSync: string | null;
  conflicts: number;
  errors: string[];
}

interface SyncHealthResponse {
  timestamp: string;
  systems: {
    airtable: SystemStatus;
    notion: SystemStatus;
    n8n: SystemStatus;
    stripe: SystemStatus;
    quickbooks: SystemStatus;
  };
  metrics: SyncMetrics;
  alerts: SyncAlert[];
  overallHealth: 'healthy' | 'warning' | 'error';
}

// In-memory storage for sync health data (in production, use Redis or database)
let syncHealthData: SyncHealthResponse = {
  timestamp: new Date().toISOString(),
  systems: {
    airtable: { status: 'healthy', lastSync: null, conflicts: 0, errors: [] },
    notion: { status: 'healthy', lastSync: null, conflicts: 0, errors: [] },
    n8n: { status: 'healthy', lastSync: null, conflicts: 0, errors: [] },
    stripe: { status: 'healthy', lastSync: null, conflicts: 0, errors: [] },
    quickbooks: { status: 'healthy', lastSync: null, conflicts: 0, errors: [] }
  },
  metrics: {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    conflictsResolved: 0
  },
  alerts: [],
  overallHealth: 'healthy'
};

export async function GET(request: NextRequest) {
  try {
    // Calculate overall health status
    const systemStatuses = Object.values(syncHealthData.systems);
    const hasErrors = systemStatuses.some(s => s.status === 'error');
    const hasWarnings = systemStatuses.some(s => s.status === 'warning');
    
    syncHealthData.overallHealth = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy';
    syncHealthData.timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: syncHealthData
    });

  } catch (error) {
    console.error('❌ Error fetching sync health data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sync health data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncHealthData = await request.json();
    const { section, data, timestamp } = body;

    console.log(`📊 Updating sync health: ${section}`);

    // Update sync health data based on section
    switch (section) {
      case 'sync-health':
        await updateSyncHealthData(data);
        break;
      
      case 'sync-alert':
        await handleSyncAlert(data);
        break;
      
      case 'milestone-completion':
        await handleMilestoneCompletion(data);
        break;
      
      case 'conflict-resolution':
        await handleConflictResolution(data);
        break;
      
      default:
        console.log(`⚠️ Unknown sync health section: ${section}`);
    }

    return NextResponse.json({
      success: true,
      message: `Sync health updated for ${section}`
    });

  } catch (error) {
    console.error('❌ Error updating sync health:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update sync health data' 
      },
      { status: 500 }
    );
  }
}

async function updateSyncHealthData(data: any) {
  // Update system statuses
  if (data.systems) {
    Object.keys(data.systems).forEach(system => {
      if (syncHealthData.systems[system as keyof typeof syncHealthData.systems]) {
        syncHealthData.systems[system as keyof typeof syncHealthData.systems] = {
          ...syncHealthData.systems[system as keyof typeof syncHealthData.systems],
          ...data.systems[system],
          lastSync: new Date().toISOString()
        };
      }
    });
  }

  // Update metrics
  if (data.metrics) {
    syncHealthData.metrics = {
      ...syncHealthData.metrics,
      ...data.metrics
    };
  }
}

async function handleSyncAlert(alertData: SyncAlert) {
  console.log(`🚨 Sync alert received: ${alertData.system} - ${alertData.conflictCount} conflicts`);
  
  // Add alert to alerts array
  syncHealthData.alerts.unshift(alertData);
  
  // Keep only last 50 alerts
  if (syncHealthData.alerts.length > 50) {
    syncHealthData.alerts = syncHealthData.alerts.slice(0, 50);
  }
  
  // Update system status to warning or error
  const systemKey = alertData.system as keyof typeof syncHealthData.systems;
  if (syncHealthData.systems[systemKey]) {
    syncHealthData.systems[systemKey].status = alertData.conflictCount > 10 ? 'error' : 'warning';
    syncHealthData.systems[systemKey].conflicts = alertData.conflictCount;
  }
}

async function handleMilestoneCompletion(data: any) {
  console.log(`🎯 Milestone completion: ${data.project} - ${data.milestone}`);
  
  // Update project-related metrics
  syncHealthData.metrics.successfulSyncs++;
  
  // Add milestone completion to alerts (as positive notification)
  syncHealthData.alerts.unshift({
    system: 'project_automation',
    conflictCount: 0,
    conflicts: [],
    timestamp: data.timestamp
  });
}

async function handleConflictResolution(data: any) {
  console.log(`✅ Conflict resolved: ${data.conflictType}`);
  
  // Update conflict resolution metrics
  syncHealthData.metrics.conflictsResolved++;
  
  // Update system status if conflicts are resolved
  if (data.system && syncHealthData.systems[data.system as keyof typeof syncHealthData.systems]) {
    const system = syncHealthData.systems[data.system as keyof typeof syncHealthData.systems];
    if (system.conflicts > 0) {
      system.conflicts--;
      if (system.conflicts === 0) {
        system.status = 'healthy';
      }
    }
  }
}
