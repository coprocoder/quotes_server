var admin = require("firebase-admin");
var serviceAccount = require("./wellness-monitor-7f223-firebase-adminsdk-vfeqh-e43de5e4ba.json");

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};
const app = admin.initializeApp(firebaseConfig);
const messaging = app.messaging();

module.exports = messaging;

// return app.delete();