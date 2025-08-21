const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function findAvailablePort(startPort = 3000, endPort = 3010) {
  for (let port = startPort; port <= endPort; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
  }
  throw new Error('No available ports found in range');
}

if (require.main === module) {
  findAvailablePort()
    .then(port => {
      console.log(port);
      process.exit(0);
    })
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { checkPort, findAvailablePort };
