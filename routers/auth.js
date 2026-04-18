import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController";
import express from "express";

export const authRouter = express.Router();

authRouter.post("/registerUser", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", logoutUser);
