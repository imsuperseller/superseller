const admin = require('firebase-admin');
const fs = require('fs');

async function verify() {
  const content = fs.readFileSync('.env.production.local', 'utf8');
  const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.+)'/);
  if (!match) {
    // If it's not single-quoted, try literal or other match
    const altMatch = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
    if (!altMatch) {
        console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.production.local');
        return;
    }
    var keyStr = altMatch[1];
  } else {
    var keyStr = match[1];
  }
  
  const serviceAccount = JSON.parse(keyStr);

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
    if (data.showLogoOnLanding) {
        console.log(`[LANDING] ID: ${doc.id}, Name: ${data.name}, LogoURL: ${data.logoUrl}`);
    } else {
        console.log(`[HIDDEN] ID: ${doc.id}, Name: ${data.name}`);
    }
  });
}

verify().catch(console.error).finally(() => process.exit());
