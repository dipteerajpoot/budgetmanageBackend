import Expense from "../Model/expense.model.js";
import Budget from "../Model/budget.model.js";
import { validationResult } from "express-validator";

/**
 * Add an Expense
 */
export const addExpense = async (req, res, next) => {
  try {
    // 1️⃣ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { category, amount, description, date } = req.body;
    const userId = req.user.id;

    // 2️⃣ Determine budget for this expense
    const expenseDate = date ? new Date(date) : new Date();
    const month = expenseDate.getMonth();
    const year = expenseDate.getFullYear();

    const budget = await Budget.findOne({ userId, month, year });
    if (!budget) {
      return res.status(400).json({ message: "No budget set for this month" });
    }

    // 3️⃣ Create expense
    const expense = await Expense.create({
      userId,
      budgetId: budget._id,
      category,
      amount,
      description,
      date: expenseDate,
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Expenses for a Budget
 */
export const getExpensesByBudget = async (req, res, next) => {
  try {
    const budgetId = req.params.budgetId;
    const expenses = await Expense.find({ budgetId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Expenses for a User (across budgets)
 */
export const getAllExpensesForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an Expense
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { category, amount, description, date } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { category, amount, description, date },
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an Expense
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);    
  }
};
