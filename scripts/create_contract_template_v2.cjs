const https = require('https');

const API_KEY = process.env.ESIGNATURES_API_KEY;
const API_HOST = 'esignatures.com';
const API_PATH = '/api/templates';

if (!API_KEY) {
    console.error('Error: ESIGNATURES_API_KEY is not set.');
    process.exit(1);
}

const data = JSON.stringify({
    title: 'Rensto Standard Agreement (Full)',
    document_elements: [
        {
            type: 'text_header_two',
            text: 'Rensto Services Agreement'
        },
        {
            type: 'text_normal',
            text: 'This agreement is made between Rensto LLC ("Provider") and the Client ("Client").'
        },
        {
            type: 'text_header_two',
            text: '1. Services & Fees'
        },
        {
            type: 'text_normal',
            text: 'Provider agrees to deliver the specific package services as purchased. Client agrees to pay the total sum as specified in the invoice.'
        },
        {
            type: 'text_header_two',
            text: '2. Terms & Conditions'
        },
        {
            type: 'text_normal',
            text: 'This agreement is governed by the standard Rensto Terms of Service available at https://rensto.com/legal/terms. By signing this document, you acknowledge you have read and agree to these terms.'
        },
        {
            type: 'text_header_two',
            text: '3. Refund Policy'
        },
        {
            type: 'text_normal',
            text: 'We offer a 30-Day Money-Back Guarantee if you are not satisfied with the initial delivery.'
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
            console.log('✅ Template V2 Created Successfully!');
            console.log('---------------------------------------------------');
            console.log(`TEMPLATE ID: ${response.data.template_id}`);
            console.log('---------------------------------------------------');
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
