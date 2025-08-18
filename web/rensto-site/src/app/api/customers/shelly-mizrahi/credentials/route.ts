import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { credentialName, values } = await request.json();

    // Load current configuration
    const configPath = path.join(process.cwd(), 'config', 'n8n', 'shelly-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // Update credential
    const credentialIndex = config.n8n.credentials.required.findIndex(
      (c: any) => c.name === credentialName
    );

    if (credentialIndex !== -1) {
      config.n8n.credentials.required[credentialIndex].missing = false;
      config.n8n.credentials.required[credentialIndex].value = values;
    }

    // Save updated configuration
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    // Create n8n credential via API
    const n8nUrl = config.n8n.url;
    const n8nApiKey = config.n8n.apiKey;

    try {
      const credentialData = {
        name: credentialName,
        type: config.n8n.credentials.required[credentialIndex].type,
        data: values
      };

      const response = await fetch(`${n8nUrl}/api/v1/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': n8nApiKey
        },
        body: JSON.stringify(credentialData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create n8n credential: ${response.statusText}`);
      }

      console.log(`Created n8n credential: ${credentialName}`);
    } catch (error) {
      console.error('Failed to create n8n credential:', error);
      // Continue anyway - the credential is saved locally
    }

    return NextResponse.json({
      success: true,
      message: 'Credential saved successfully'
    });

  } catch (error) {
    console.error('Failed to save credential:', error);
    return NextResponse.json(
      { error: 'Failed to save credential' },
      { status: 500 }
    );
  }
}
