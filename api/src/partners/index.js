import express from "express";
import updatePartner from "./updatePartner.route.js";
import deletePartner from "./deletePartner.route.js";
import addPartner from "./addPartner.js";


const router = express.Router();

router.use("/", updatePartner);
router.use("/", deletePartner);
router.use("/", addPartner);

export default router;
