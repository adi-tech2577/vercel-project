import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

/**
 * DELETE /api/partners/:userMobile/delete/:partnerMobile
 */
router.delete("/:userMobile/delete/:partnerMobile", async (req, res) => {
  try {
    const { userMobile, partnerMobile } = req.params;

    if (!userMobile || !partnerMobile)
      return res.status(400).json({ error: "Both userMobile and partnerMobile are required" });

    const userPartnerRef = db
      .collection("users")
      .doc(userMobile)
      .collection("partners")
      .doc(partnerMobile);

    await userPartnerRef.delete();

    res.json({ message: "Partner deleted successfully" });
  } catch (err) {
    console.error("Error deleting partner:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
