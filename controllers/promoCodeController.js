import { db } from "../createTable.js";

export const getPromoCodes = (req, res) => {
    const promoCodes = db.prepare("SELECT * FROM promo_codes").all();
    res.json(promoCodes);
};

export const getPromoCodeById = (req, res) => {
    const { promoCodeId } = req.params;
    const promoCode = db.prepare("SELECT * FROM promo_codes WHERE id = ?").get(promoCodeId);
    res.json(promoCode);
};

export const createPromoCode = (req, res) => {
    const { code, discount_type, discount_value } = req.body;
    const promoCode = db.prepare("INSERT INTO promo_codes (code, discount_type, discount_value) VALUES (?, ?, ?)").run(code, discount_type, discount_value);
    res.json(promoCode);
};

export const updatePromoCode = (req, res) => {
    const { promoCodeId } = req.params;
    const { code, discount_type, discount_value } = req.body;
    const promoCode = db.prepare("UPDATE promo_codes SET code = ?, discount_type = ?, discount_value = ? WHERE id = ?").run(code, discount_type, discount_value, promoCodeId);
    res.json(promoCode);
}

export const deletePromoCode = (req, res) => {
    const { promoCodeId } = req.params;
    const promoCode = db.prepare("DELETE FROM promo_codes WHERE id = ?").run(promoCodeId);
    res.json(promoCode);
};
