import express from "express";
import { getPromoCodes, getPromoCodeById, createPromoCode, updatePromoCode, deletePromoCode } from "../controllers/promoCodeController.js";
export const promoCodesRouter = express.Router();

promoCodesRouter.get("/", getPromoCodes);
promoCodesRouter.get("/:promoCodeId", getPromoCodeById);
promoCodesRouter.post("/create-promo-code", createPromoCode);
promoCodesRouter.put("/update-promo-code/:promoCodeId", updatePromoCode);
promoCodesRouter.delete("/delete-promo-code/:promoCodeId", deletePromoCode);