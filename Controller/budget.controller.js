import Expense from "../Model/expense.model.js";
import Budget from "../Model/budget.model.js";
import { validationResult } from "express-validator";

/**
 * Create a new Budget
 */
export const createBudget = async (req, res, next) => {
  try {
    // 1️⃣ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { month, year, amount } = req.body;
    const userId = req.user.id;

    // 2️⃣ Check if budget already exists for this month/year
    const existingBudget = await Budget.findOne({ userId, month, year });
    if (existingBudget) {
      return res.status(400).json({ message: "Budget already exists for this month" });
    }

    // 3️⃣ Create budget
    const budget = await Budget.create({ userId, month, year, amount });
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Budgets of a user
 */
export const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ userId }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single Budget by ID
 */
export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Budget
 */
export const updateBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { amount },
      { new: true }
    );

    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Budget
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Budget with Expenses + Prediction
 */
export const getBudgetWithPrediction = async (req, res, next) => {
  try {
    const budgetId = req.params.id;

    // 1️⃣ Fetch Budget
    const budget = await Budget.findById(budgetId);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    // 2️⃣ Fetch Expenses for this budget
    const expenses = await Expense.find({ budgetId });

    // 3️⃣ Calculate total spent
    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 4️⃣ Prediction logic
    const today = new Date();
    const daysPassed = today.getDate();
    const avgPerDay = totalSpent / daysPassed;
    const daysInMonth = new Date(budget.year, budget.month + 1, 0).getDate();
    const predictedTotal = avgPerDay * daysInMonth;

    // 5️⃣ Send response
    res.json({
      budget,
      totalSpent,
      avgPerDay,
      predictedTotal,
      message:
        predictedTotal > budget.amount
          ? `At this rate, you will overspend your budget by ${predictedTotal - budget.amount}`
          : "You are on track with your budget",
    });
  } catch (error) {
    next(error);
  }
};
