import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    // Load Shelly's configuration
    const configPath = path.join(process.cwd(), 'config', 'n8n', 'shelly-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    const n8nUrl = config.n8n.url;
    const n8nApiKey = config.n8n.apiKey;

    // Test webhook endpoint
    const testData = {
      files: [
        {
          name: 'עמית הר ביטוח 05.08.25.xlsx',
          size: 14336,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    const response = await fetch(`${n8nUrl}/webhook/shelly-excel-processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Workflow test successful',
        result
      });
    } else {
      throw new Error(`Workflow test failed: ${response.statusText}`);
    }

  } catch (error) {
    console.error('Workflow test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
