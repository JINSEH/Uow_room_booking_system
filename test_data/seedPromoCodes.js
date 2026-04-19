import { db } from "../createTable.js";

db.exec(`
    INSERT OR IGNORE INTO promo_codes (code, discount_type, discount_value) VALUES
    ('SAVE10', 'flat', 10.00),
    ('SAVE20', 'flat', 20.00),
    ('HALFOFF', 'percent', 50.00),
    ('STUDENT10', 'percent', 10.00),
    ('WELCOME5', 'flat', 5.00);
`)

console.log("Promo codes inserted successfully!")