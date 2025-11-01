import express from "express";
import registerUser from "./registerUser.route.js";
import getAllUsers from "./getAllUsers.js";

const router = express.Router();

router.use("/", registerUser);
router.use("/", getAllUsers);

export default router;
