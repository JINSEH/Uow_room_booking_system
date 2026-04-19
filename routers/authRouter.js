import {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
} from "../controllers/authController.js";
import express from "express";
import { authenticateToken, requireStaff } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/registerUser", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", logoutUser);
authRouter.get("/all-users", authenticateToken, requireStaff, getUsers);
