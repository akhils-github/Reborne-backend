import express from "express";
import { authUser, getCurrentUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCurrentUser);
router.post("/login", authUser);

export default router;
