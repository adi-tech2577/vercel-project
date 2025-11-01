import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

/**
 * POST /api/users/register
 * body: { mobileNumber, name?, lat?, long?}
 */
router.post("/register", async (req, res) => {
  try {
    const { mobileNumber, name, latitude: lat, longitude: long, skills: skill="", active=false } = req.body;
    if (!mobileNumber)
      return res.status(400).json({ error: "mobileNumber is required" });

    const userRef = db.collection("users").doc(String(mobileNumber).trim());
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const existingUser = userSnap.data();

      // If new info provided, update existing record
      if (name || lat || long || skill || active || !active) {
        const skills = skill;

        const updates = {
          ...(name && { name }),
          ...(lat && { lat }),
          ...(long && { long }),
          ...(skills && { skills }),
          ...({ active }),
          updatedAt: new Date(),
        };
        await userRef.update(updates);
        Object.assign(existingUser, updates);
      }
      
      return res.status(200).json({
        message: "profile updated!",
        success: true,
        user: existingUser,
        isReturningUser: true,
      });
    }
    // New user registration
    const userData = {
      mobileNumber,
      name: name || "",
      lat: lat || null,
      long: long || null,
      skill: skill || "",
      active: active || false,
      createdAt: new Date(),
    };

    await userRef.set(userData);

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
      isReturningUser: false,
    });
  } catch (err) {
    console.error("Error registering/updating user:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
