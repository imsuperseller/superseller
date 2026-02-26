const admin = require('firebase-admin');
const fs = require('fs');

async function verify() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.+)'/);
  const serviceAccount = JSON.parse(match[1]);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const snap = await db.collection('clients').where('showLogoOnLanding', '==', true).get();
  console.log('--- CLIENTS SHOWING ON LANDING ---');
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, Name: ${data.name}, LogoURL: ${data.logoUrl}`);
  });
}

verify().catch(console.error).finally(() => process.exit());
