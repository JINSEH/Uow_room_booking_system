import express from "express";
import { getPromoCodes, getPromoCodeById, createPromoCode, updatePromoCode, deletePromoCode } from "../controllers/promoCodeController.js";
import { authenticateToken, requireStaff } from "../middleware/auth.js";
export const promoCodesRouter = express.Router();

promoCodesRouter.get("/", authenticateToken, requireStaff, getPromoCodes);
promoCodesRouter.get("/:promoCodeId", authenticateToken, requireStaff,getPromoCodeById);
promoCodesRouter.post("/create-promo-code", authenticateToken, requireStaff, createPromoCode);
promoCodesRouter.put("/update-promo-code/:promoCodeId", authenticateToken, requireStaff, updatePromoCode);
promoCodesRouter.delete("/delete-promo-code/:promoCodeId", authenticateToken, requireStaff,deletePromoCode);