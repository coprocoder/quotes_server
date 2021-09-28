var admin = require("firebase-admin");

const firebaseConfig = {
  apiKey: "AIzaSyC66povpbiXZA15xBXZqjHTyUyYPZ-9kyI",
  authDomain: "med-rn-web.firebaseapp.com",
  projectId: "med-rn-web",
  storageBucket: "med-rn-web.appspot.com",
  messagingSenderId: "302871522782",
  appId: "1:302871522782:web:a01ae6f91984d7632d814f",
  measurementId: "G-BJFXLDTJ9L",
  credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
};

// Initialize Firebase
const app = admin.initializeApp(firebaseConfig);

let defaultAuth = app.auth();
let defaultDatabase = app.database();
let messaging = app.messaging();

export {messaging}