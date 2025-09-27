import express from "express";
import { body } from "express-validator";
import { signUp, login, getProfile, verifyAccount } from "../Controller/user.controller.js";
import { authMiddleware } from "../Middelwere/auth.js";

const router = express.Router();

// ------------------- User Signup -------------------
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  signUp
);

// ------------------- User Login -------------------
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// ------------------- Get User Profile -------------------
router.get("/profile", authMiddleware, getProfile);

// ------------------- Verify Account (optional) -------------------
router.post("/verify", authMiddleware, verifyAccount);

export default router;
