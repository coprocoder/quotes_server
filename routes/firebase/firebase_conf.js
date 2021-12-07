var admin = require("firebase-admin");

var serviceAccount = require("./wellness-monitor-7f223-firebase-adminsdk-vfeqh-b56a158c02.json");

const firebaseConfig = {
  apiKey: "AIzaSyCmjhZWEzjhMbRB7i_l3bZJG2l4pNZ1ZXc",
  authDomain: "wellness-monitor-7f223.firebaseapp.com",
  projectId: "wellness-monitor-7f223",
  storageBucket: "wellness-monitor-7f223.appspot.com",
  messagingSenderId: "14445026727",
  appId: "1:14445026727:web:a0723b8857a95cedbeea82",
  databaseURL: "",
  credential: admin.credential.cert(serviceAccount),
};
// Initialize Firebase
const app = admin.initializeApp(firebaseConfig);

let messaging = app.messaging();

module.exports = messaging;
