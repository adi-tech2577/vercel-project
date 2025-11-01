import express from "express";
import multer from "multer";
import imagekit from "../imagekit.js";
import { db } from "../firebase.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    const { mobileNumber, description } = req.body;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No images uploaded" });

    const uploads = await Promise.all(
      req.files.map((file) =>
        imagekit.upload({
          file: file.buffer.toString("base64"),
          fileName: file.originalname,
          folder: "posts",
        })
      )
    );

    const postData = {
      mobileNumber,
      description,
      images: uploads.map((u) => ({ url: u.url })),
      timeStamp: new Date(),
    };

    const postRef = await db.collection("posts").add(postData);
    await postRef.update({ postId: postRef.id });

    res.json({
      message: "Post created successfully",
      id: postRef.id,
      post: { ...postData, postId: postRef.id },
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
