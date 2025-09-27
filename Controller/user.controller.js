import User from "../Model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";

/**
 * Send Email function
 */
const sendEmail = (name, email) => {
  return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      })

      let mailOption = {
          from: process.env.EMAIL,
          to: email,
          subject: "Account Verification - Budget Management App",
          html: `<h3>Dear ${name}</h3>
          <p>Welcome to Budget Management App! Please verify your account to complete the registration process.</p>
          <p>Click the button below to verify your account:</p>
          <form method="post" action="${process.env.BASE_URL || 'http://localhost:3000'}/user/verify">
          <input type="hidden" name="email" value="${email}" />
          <button type="submit" style="background-color: #007bff; color: white; width: 200px; height: 40px; border: none; border-radius: 10px; cursor: pointer;">Verify Account</button>
          </form>
          <p>If the button doesn't work, you can also verify by sending a POST request to the verification endpoint with your email.</p>
          <p>
          <h6>Thank You</h6>
          Budget Management Team
          </p> 
          `
      };
      transporter.sendMail(mailOption, function (error, info) {
          if (error) {
              console.error("Email not sent:", error.message);
              reject(error);
          }
          else {
              console.log("Email sent successfully:", info.response);
              resolve();
          }
      });
  });
}

/**
 * User Signup
 */
export const signUp = async (req, res, next) => {
  try {
    // 1️⃣ Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // 2️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Send welcome email
    sendEmail(name, email);

    // 6️⃣ Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Account is not available please signUp first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Account not verified. Please verify your account before logging in." 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (request, response, next) => {
    try {
        let { email } = request.body;
        let result = await User.updateOne({ email }, { $set: { "isVerified": true } });
        if (result.matchedCount === 0)
            return response.status(404).json({ error: "User not found" });
        if (result.modifiedCount === 0)
            return response.status(200).json({ message: "Already verified" });
        return response.status(201).json({ message: "verification completed" })
    }
    catch (error) {
        console.log(error)
        return response.status(500).json({ error: "Internal Server Error" });
    }
}

