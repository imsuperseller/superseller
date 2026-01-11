const admin = require('firebase-admin');
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.+)'/);
const serviceAccount = JSON.parse(match[1]);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.collection('clients').where('showLogoOnLanding', '==', true).get().then(snap => {
  snap.forEach(doc => console.log(doc.data().name));
  process.exit(0);
});
