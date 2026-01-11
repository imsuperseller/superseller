const axios = require('axios');

const url = 'http://172.245.56.50:5678/mcp/907043da-60a4-4729-882d-d3205ff386fa';

async function test() {
    try {
        console.log('Testing connection with axios...');
        const response = await axios.get(url, {
            headers: {
                'Accept': 'text/event-stream',
                'User-Agent': 'curl/8.7.1'
            },
            responseType: 'stream'
        });
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        response.data.on('data', (chunk) => {
            console.log('Received chunk:', chunk.toString());
            process.exit(0); // Exit after first chunk
        });
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

test();
