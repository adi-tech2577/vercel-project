import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT not found in .env");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Loaded Firebase service account:", serviceAccount.client_email);
}

const db = admin.firestore();
export { db };
