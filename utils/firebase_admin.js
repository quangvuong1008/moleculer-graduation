const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.GRADUATION_GOOGLE_APPLICATION_CREDENTIALS);
module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://graduation-project-b1757-default-rtdb.firebaseio.com"
});