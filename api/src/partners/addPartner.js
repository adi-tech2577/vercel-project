import express from "express";
import { db } from "../firebaseConfig.js";

const router = express.Router();

/**
 * POST /api/partners/:userMobile/add
 * body: { name, mobileNumber }
 */
router.post("/:userMobile/add", async (req, res) => {
  try {
    const userMobile = String(req.params.userMobile || "").trim();
    const name = req.body.name || "";
    const partnerMobile = String(req.body.mobileNumber || "").trim();

    // ✅ Validation
    if (!userMobile || !partnerMobile) {
      return res
        .status(400)
        .json({ error: "Both userMobile and partner mobileNumber are required" });
    }

    const userRef = db.collection("users").doc(userMobile);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const partnerRef = db.collection("partners").doc(partnerMobile);
    const partnerSnap = await partnerRef.get();

    if (!partnerSnap.exists) {
      await partnerRef.set({
        name,
        mobileNumber: partnerMobile,
        createdAt: new Date(),
      });
    }

    await userRef.collection("partners").doc(partnerMobile).set({
      name,
      mobileNumber: partnerMobile,
      linkedAt: new Date(),
    });

    res.json({ message: "Partner added successfully" });
  } catch (err) {
    console.error("Error adding partner:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
