const https = require('https');

const API_KEY = process.env.ESIGNATURES_API_KEY;
const API_HOST = 'esignatures.com';
const API_PATH = '/api/templates';

if (!API_KEY) {
    console.error('Error: ESIGNATURES_API_KEY is not set.');
    process.exit(1);
}

const data = JSON.stringify({
    title: 'Rensto Standard Agreement',
    document_elements: [
        {
            type: 'text_header_two',
            text: 'Rensto Services Agreement'
        }
    ],
    signer_roles: [
        {
            id: 'Client',
            name: 'Client',
            order: 1
        }
    ],
    cc_email_addresses: ['shai@rensto.com']
});

const options = {
    hostname: API_HOST,
    port: 443,
    path: API_PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64')
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const response = JSON.parse(body);
            console.log('✅ Template Created Successfully!');
            console.log('---------------------------------------------------');
            console.log(`TEMPLATE ID: ${response.data.template_id}`);
            console.log('---------------------------------------------------');
            console.log('Please save this ID to your .env file as ESIGNATURES_TEMPLATE_ID');
        } else {
            console.error(`❌ Error creating template (Status: ${res.statusCode}):`);
            console.error(body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
