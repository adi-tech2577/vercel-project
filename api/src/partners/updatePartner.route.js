import express from "express";
import { db } from "../firebaseConfig.js";

const router = express.Router();

/**
 * PUT /api/partners/:mobileNumber
 * body: { partnerName, location, rating, ... }
 */
router.put("/:mobileNumber", async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const partnerData = req.body;

    if (!mobileNumber)
      return res.status(400).json({ error: "mobileNumber required" });

    const partnerRef = db.collection("partners").doc(mobileNumber);

    await partnerRef.set(
      { ...partnerData, mobileNumber, updatedAt: new Date() },
      { merge: true }
    );

    res.json({ message: "Partner data updated successfully" });
  } catch (err) {
    console.error("Error updating partner:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
