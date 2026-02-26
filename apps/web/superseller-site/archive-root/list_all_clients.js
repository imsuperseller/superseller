const admin = require('firebase-admin');
const fs = require('fs');

async function listAll() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.+)'/);
  const serviceAccount = JSON.parse(match[1]);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  console.log('Project ID:', serviceAccount.project_id);
  const snap = await db.collection('clients').get();
  console.log('Total Clients:', snap.size);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, Name: ${data.name}, showLogoOnLanding: ${data.showLogoOnLanding}, LogoURL: ${data.logoUrl}`);
  });
}

listAll().catch(console.error).finally(() => process.exit());
