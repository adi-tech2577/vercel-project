import express from "express";
import createPost from "./createPost.route.js";
import getAllPosts from "./getAllPosts.route.js";

const router = express.Router();

// mount post routes
router.use("/", createPost);
router.use("/", getAllPosts);

export default router;
