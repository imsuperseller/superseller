const admin = require('firebase-admin');
const fs = require('fs');

async function seed() {
  const content = fs.readFileSync('.env.production.local', 'utf8');
  const lines = content.split('\n');
  const line = lines.find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
  let keyStr = line.substring('FIREBASE_SERVICE_ACCOUNT_KEY='.length);
  if (keyStr.startsWith("'") && keyStr.endsWith("'")) keyStr = keyStr.substring(1, keyStr.length - 1);
  const serviceAccount = JSON.parse(keyStr);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  console.log('Using Project:', serviceAccount.project_id);

  const clients = [
    {
      id: 'client_ardan',
      data: {
        name: 'Ardan',
        logoUrl: '/images/logos/logo-ardan-transparent.png',
        showLogoOnLanding: true,
        status: 'active'
      }
    },
    {
      id: 'client_insurance_shelly',
      data: {
        name: 'Shelly Mizrahi',
        logoUrl: '/images/logos/logo-shelly-mizrahi.png',
        showLogoOnLanding: true,
        status: 'active'
      }
    },
    {
      id: 'client_tax4us',
      data: {
        name: 'Tax4US',
        logoUrl: '/images/logos/logo-tax4us.png',
        showLogoOnLanding: true,
        status: 'active'
      }
    },
    {
      id: 'client_wondercare',
      data: {
        name: 'Wonder.Care',
        logoUrl: '/images/logos/logo-wondercare.png',
        showLogoOnLanding: true,
        status: 'active'
      }
    }
  ];

  for (const client of clients) {
    await db.collection('clients').doc(client.id).set(client.data, { merge: true });
    console.log(`Seeded/Updated ${client.data.name}`);
  }
}

seed().catch(console.error).finally(() => process.exit());
