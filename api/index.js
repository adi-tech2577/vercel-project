import express from "express";
import functions from "firebase-functions";
import admin from "firebase-admin";

import postsRouter from "./src/posts/index.js";
import partnersRouter from "./src/partners/index.js";
import usersRouter from "./src/users/index.js";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app
const app = express();

// Mount your routes
app.use("/posts", postsRouter);
app.use("/partners", partnersRouter);
app.use("/users", usersRouter);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Firebase Express API is running");
});

// Export to Firebase Cloud Functions
export const api = functions.https.onRequest(app);
