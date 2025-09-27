import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import userRoutes from "./Router/user.router.js";
import budgetRoutes from "./Router/budget.router.js";
import expenseRoutes from "./Router/expense.router.js";

const app = express();

// -------------------- Middleware --------------------
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// -------------------- Routes --------------------
app.use("/api/users", userRoutes);       // User signup/login/profile
app.use("/api/budgets", budgetRoutes);   // Budget CRUD + prediction
app.use("/api/expenses", expenseRoutes); // Expenses CRUD

// -------------------- Error Handling Middleware --------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || "Internal Server Error" });
});

// -------------------- Connect to MongoDB & Start Server --------------------
mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection Error:", err);
    });
