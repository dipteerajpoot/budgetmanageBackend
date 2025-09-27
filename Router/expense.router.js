import express from "express";
import { body } from "express-validator";
import {
  addExpense,
  getExpensesByBudget,
  getAllExpensesForUser,
  updateExpense,
  deleteExpense,
} from "../Controller/expenses.controller.js";
import { authMiddleware } from "../Middelwere/auth.js";

const router = express.Router();

// Add Expense
router.post(
  "/",
  authMiddleware,
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
    body("date").optional().isISO8601().toDate().withMessage("Invalid date"),
  ],
  addExpense
);

// Get all Expenses for a budget
router.get("/budget/:budgetId", authMiddleware, getExpensesByBudget);

// Get all Expenses for user
router.get("/", authMiddleware, getAllExpensesForUser);

// Update Expense
router.put(
  "/:id",
  authMiddleware,
  [
    body("category").optional().notEmpty(),
    body("amount").optional().isFloat({ min: 0 }),
    body("date").optional().isISO8601().toDate(),
  ],
  updateExpense
);

// Delete Expense
router.delete("/:id", authMiddleware, deleteExpense);

export default router;
