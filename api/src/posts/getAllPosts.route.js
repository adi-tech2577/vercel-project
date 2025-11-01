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
        ? `${(distance / 1000).toFixed(2)} km`
        : `${Math.round(distance)} m`,
    value: distance,
  };
};

/**
 * GET /api/posts?mobileNumber=9990001111
 * Streams all posts with user name, partners, and distance (sorted nearest first)
 */
router.get("/", async (req, res) => {
  try {
    const { mobileNumber } = req.query;
    if (!mobileNumber)
      return res.status(400).json({ error: "mobileNumber is required" });

    // 🧭 Get current user
    const userSnap = await db
      .collection("users")
      .where("mobileNumber", "==", mobileNumber)
      .limit(1)
      .get();

    if (userSnap.empty)
      return res.status(404).json({ error: "User not found" });
    const currentUser = userSnap.docs[0].data();
    const { lat: userLat, long: userLng } = currentUser;
    console.log("userLat ",userLat)
    console.log("userLng ",userLng)

    if (!userLat || !userLng)
      return res
        .status(400)
        .json({ error: "Current user does not have lat/long" });

    // 🧩 Get all partners (in memory for quick lookup)
    const partnersSnap = await db.collection("partners").get();
    const partnersMap = {};
    partnersSnap.forEach((doc) => {
      const data = doc.data();
      partnersMap[data.mobileNumber] = data;
    });

    // 🖼️ Get all posts
    const postsSnap = await db
      .collection("posts")
      .orderBy("timeStamp", "desc")
      .get();

    const postsWithDetails = [];

    for (const doc of postsSnap.docs) {
      const postData = doc.data();
      const postMobile = postData.mobileNumber;

      // Get user info for this post
      const userSnap = await db
        .collection("users")
        .where("mobileNumber", "==", postMobile)
        .limit(1)
        .get();

      let userInfo = {};
      let distanceInfo = { text: "Unknown", value: Number.MAX_VALUE };

      if (!userSnap.empty) {
        const user = userSnap.docs[0].data();
        userInfo = user;

        if (user.lat && user.long) {
          distanceInfo = haversineDistance(
            userLat,
            userLng,
            user.lat,
            user.long
          );
        }
      }

      // Get partner list (array)
      const partnerList = Object.values(partnersMap).filter(
        (p) => p.mobileNumber && p.mobileNumber !== postMobile
      );

      postsWithDetails.push({
        description: postData.description || "",
        mobileNumber: postMobile,
        name: userInfo.name || "Unknown",
        images: (postData.images || []).map((img) => img.url),
        distance: distanceInfo.text,
        distanceValue: distanceInfo.value,
        partner: partnerList.map((p) => ({
          mobileNumber: p.mobileNumber,
          name: p.name || "",
        })),
      });
    }

    // 📏 Sort by distance (nearest first)
    postsWithDetails.sort((a, b) => a.distanceValue - b.distanceValue);

    // Stream NDJSON
    res.setHeader("Content-Type", "application/x-ndjson");
    postsWithDetails.forEach((post) => {
      res.write(JSON.stringify(post) + "\n");
    });
    res.end();
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
