import express from "express";
import { body } from "express-validator";
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetWithPrediction,
} from "../Controller/budget.controller.js";
import { authMiddleware } from "../Middelwere/auth.js";

const router = express.Router();

// Create Budget
router.post(
  "/",
  authMiddleware,
  [
    body("month").isInt({ min: 0, max: 11 }).withMessage("Month must be 0-11"),
    body("year").isInt({ min: 2000 }).withMessage("Year is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  ],
  createBudget
);

// Get All Budgets
router.get("/", authMiddleware, getBudgets);

// Get Budget by ID
router.get("/:id", authMiddleware, getBudgetById);

// Update Budget
router.put("/:id", authMiddleware, updateBudget);

// Delete Budget
router.delete("/:id", authMiddleware, deleteBudget);

// Budget + Expenses + Prediction
router.get("/:id/prediction", authMiddleware, getBudgetWithPrediction);

export default router;
