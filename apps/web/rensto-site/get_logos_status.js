const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkLogos() {
  const clientsSnap = await db.collection('clients').where('showLogoOnLanding', '==', true).get();
  const clients = [];
  clientsSnap.forEach(doc => {
    clients.push({ id: doc.id, ...doc.data() });
  });
  console.log(JSON.stringify(clients, null, 2));
}

checkLogos().catch(console.error);
