const axios = require('axios');
const http = require('http');

// 1. Start a slow mock server
const MOCK_PORT = 9999;
const server = http.createServer((req, res) => {
    console.log(`[Mock Server] Received request: ${req.method} ${req.url}`);

    // Simulate a 30-second delay
    setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Delayed response received' }));
        console.log('[Mock Server] Sent response after 30s');
    }, 30000);
});

server.listen(MOCK_PORT, async () => {
    console.log(`[Mock Server] Listening on port ${MOCK_PORT}`);

    // 2. Test axios timeout (should be > 30s now)
    try {
        console.log('[Test] Sending request with 300s timeout...');
        const response = await axios.post(`http://localhost:${MOCK_PORT}`, { test: true }, {
            timeout: 300000 // Match proxy timeout
        });
        console.log('[Test] Success:', response.data);
        process.exit(0);
    } catch (error) {
        console.error('[Test] Failed:', error.message);
        process.exit(1);
    }
});
