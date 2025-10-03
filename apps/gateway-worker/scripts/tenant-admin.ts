#!/usr/bin/env node

/**
 * KV Tenant Admin CLI
 * 
 * Usage:
 *   npm run tenant:get <tenant-id>
 *   npm run tenant:set <tenant-id> <json-file>
 *   npm run tenant:list
 *   npm run tenant:delete <tenant-id>
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const KV_NAMESPACE_ID = process.env.TENANT_REGISTRY_KV_ID;

if (!CLOUDFLARE_API_TOKEN || !ACCOUNT_ID || !KV_NAMESPACE_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   CLOUDFLARE_API_TOKEN');
    console.error('   CLOUDFLARE_ACCOUNT_ID');
    console.error('   TENANT_REGISTRY_KV_ID');
    process.exit(1);
}

const command = process.argv[2];
const tenantId = process.argv[3];

async function kvRequest(method: string, key: string, value?: string) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;

    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'text/plain'
        }
    };

    if (value) {
        options.body = value;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`KV API error: ${response.status} ${error}`);
    }

    return response;
}

async function listKeys() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/keys`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });

    if (!response.ok) {
        throw new Error(`KV list error: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.map((key: any) => key.name) || [];
}

async function getTenant(id: string) {
    const response = await kvRequest('GET', `tenant:${id}`);
    const text = await response.text();
    return JSON.parse(text);
}

async function setTenant(id: string, jsonFile: string) {
    const filePath = join(process.cwd(), jsonFile);
    const content = readFileSync(filePath, 'utf8');

    // Validate JSON
    const tenant = JSON.parse(content);
    if (!tenant.id) {
        throw new Error('Tenant JSON must have an "id" field');
    }
    if (!tenant.hmacSecret) {
        throw new Error('Tenant JSON must have an "hmacSecret" field');
    }

    await kvRequest('PUT', `tenant:${id}`, content);
    console.log(`✅ Tenant ${id} updated successfully`);
}

async function deleteTenant(id: string) {
    await kvRequest('DELETE', `tenant:${id}`);
    console.log(`✅ Tenant ${id} deleted successfully`);
}

async function main() {
    try {
        switch (command) {
            case 'get':
                if (!tenantId) {
                    console.error('❌ Usage: npm run tenant:get <tenant-id>');
                    process.exit(1);
                }
                const tenant = await getTenant(tenantId);
                console.log(JSON.stringify(tenant, null, 2));
                break;

            case 'set':
                const jsonFile = process.argv[4];
                if (!tenantId || !jsonFile) {
                    console.error('❌ Usage: npm run tenant:set <tenant-id> <json-file>');
                    process.exit(1);
                }
                await setTenant(tenantId, jsonFile);
                break;

            case 'list':
                const keys = await listKeys();
                const tenantKeys = keys.filter((key: string) => key.startsWith('tenant:'));
                console.log('📋 Tenant IDs:');
                tenantKeys.forEach(key => {
                    const id = key.replace('tenant:', '');
                    console.log(`  - ${id}`);
                });
                break;

            case 'delete':
                if (!tenantId) {
                    console.error('❌ Usage: npm run tenant:delete <tenant-id>');
                    process.exit(1);
                }
                await deleteTenant(tenantId);
                break;

            default:
                console.log('🔧 KV Tenant Admin CLI');
                console.log('');
                console.log('Commands:');
                console.log('  get <tenant-id>     - Get tenant configuration');
                console.log('  set <tenant-id> <json-file> - Set tenant from JSON file');
                console.log('  list                - List all tenant IDs');
                console.log('  delete <tenant-id>  - Delete tenant');
                console.log('');
                console.log('Environment variables required:');
                console.log('  CLOUDFLARE_API_TOKEN');
                console.log('  CLOUDFLARE_ACCOUNT_ID');
                console.log('  TENANT_REGISTRY_KV_ID');
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
