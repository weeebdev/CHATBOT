const admin = require("firebase-admin");
const serviceAccount = require("./corona-bot-b8b14-firebase-adminsdk-xmzha-e72a3a9c49.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corona-bot-b8b14.firebaseio.com"
});

let db = admin.firestore();
module.exports = db;