require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.CORONA_DBO);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corona-bot-b8b14.firebaseio.com"
});

let db = admin.firestore();
module.exports = db;
