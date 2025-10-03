import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

/**
 * 🚀 N8N UPDATE API ENDPOINT
 * 
 * This endpoint provides a complete n8n update system that can be executed
 * from the admin dashboard with zero context needed.
 * 
 * POST /api/n8n/update
 * 
 * Body:
 * {
 *   "dryRun": boolean (optional),
 *   "force": boolean (optional)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dryRun = false, force = false } = body;

    // Log the request
    console.log('🚀 N8N UPDATE REQUEST RECEIVED');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🔧 Dry Run: ${dryRun}`);
    console.log(`⚡ Force Mode: ${force}`);

    // Path to the update script
    const scriptPath = path.join(process.cwd(), 'scripts', 'n8n-complete-update-system.js');
    
    // Build command arguments
    const args = [];
    if (dryRun) args.push('--dry-run');
    if (force) args.push('--force');
    
    const command = `node "${scriptPath}" ${args.join(' ')}`;

    console.log(`🔧 Executing command: ${command}`);

    // Execute the update script
    const startTime = Date.now();
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        timeout: 300000, // 5 minutes timeout
        cwd: process.cwd()
      });
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('✅ N8N UPDATE COMPLETED SUCCESSFULLY');
      console.log(`⏱️ Duration: ${duration} seconds`);

      return NextResponse.json({
        success: true,
        message: 'N8N update completed successfully',
        duration: `${duration} seconds`,
        output: output,
        timestamp: new Date().toISOString(),
        dryRun: dryRun,
        force: force
      });

    } catch (error: any) {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.error('❌ N8N UPDATE FAILED');
      console.error(`⏱️ Duration: ${duration} seconds`);
      console.error(`🚨 Error: ${error.message}`);

      return NextResponse.json({
        success: false,
        message: 'N8N update failed',
        error: error.message,
        duration: `${duration} seconds`,
        timestamp: new Date().toISOString(),
        dryRun: dryRun,
        force: force
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ API ERROR:', error.message);
    
    return NextResponse.json({
      success: false,
      message: 'API error occurred',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for status check
export async function GET() {
  try {
    // Check n8n status
    const n8nUrl = 'http://173.254.201.134:5678';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA';
    
    // Test n8n connectivity
    const testCommand = `curl -s -H "X-N8N-API-KEY: ${apiKey}" ${n8nUrl}/api/v1/workflows | jq length`;
    
    try {
      const output = execSync(testCommand, { encoding: 'utf8', timeout: 10000 });
      const workflowCount = parseInt(output.trim());
      
      return NextResponse.json({
        success: true,
        status: 'online',
        n8n_url: n8nUrl,
        workflow_count: workflowCount,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        status: 'offline',
        n8n_url: n8nUrl,
        error: 'Cannot connect to n8n instance',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Status check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
