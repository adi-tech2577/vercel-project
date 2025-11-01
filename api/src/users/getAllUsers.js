import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

/** Haversine formula to calculate distance */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    text:
      distance >= 1000
        ? `${(distance / 1000).toFixed(2)}km`
        : `${Math.round(distance)}m`,
    value: distance,
  };
};

/**
 * GET /api/users?mobileNumber=9990001111
 * Returns all users with distance from given mobileNumber
 */
router.get("/", async (req, res) => {
  try {
    const { mobileNumber, skill } = req.query;
    if (!mobileNumber)
      return res.status(400).json({ success: false, message: "mobileNumber is required" });

    // Get current user
    const currentUserSnap = await db
      .collection("users")
      .where("mobileNumber", "==", mobileNumber)
      .limit(1)
      .get();

    if (currentUserSnap.empty)
      return res.status(404).json({ success: false, message: "User not found" });

    const currentUser = currentUserSnap.docs[0].data();
    const { lat: userLat, long: userLng } = currentUser;

    if (!userLat || !userLng)
      return res.status(400).json({
        success: false,
        message: "Current user does not have lat/long",
      });

    // Fetch all users
    const usersSnap = await db.collection("users").get();
    const users = [];

    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.lat || !data.long || data.mobileNumber === mobileNumber) return;

      if (skill && !data.skills.includes(skill.toLowerCase())) return;

      const dist = haversineDistance(userLat, userLng, data.lat, data.long);

      users.push({
        active: data.active || false,
        skills: data.skills || "",
        mobileNumber: data.mobileNumber,
        name: data.name || "Unknown",
        distance: dist.text,
        distanceValue: dist.value,
      });
    });

    // Sort by distance
    users.sort((a, b) => a.distanceValue - b.distanceValue);

    return res.json({
      success: true,
      data: users.map(({ distanceValue, ...u }) => u),
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
