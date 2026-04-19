import Database from "better-sqlite3";

export const db = new Database("database.db");

// db.exec(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     password_hash TEXT NOT NULL,
//     role TEXT CHECK(role IN ('staff', 'student')) NOT NULL
//   );

//   CREATE TABLE IF NOT EXISTS rooms (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     capacity INTEGER NOT NULL,
//     price REAL NOT NULL,
//     status TEXT CHECK(status IN ('draft', 'launched')) DEFAULT 'draft',
//     date TEXT,
//     start_time TEXT,
//     end_time TEXT,
//     created_by INTEGER NOT NULL,
//     FOREIGN KEY (created_by) REFERENCES users(id)
//   );

//   CREATE TABLE IF NOT EXISTS promo_codes (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     room_id INTEGER NOT NULL,
//     code TEXT UNIQUE NOT NULL,
//     discount_type TEXT CHECK(discount_type IN ('flat', 'percent')) NOT NULL,
//     discount_value REAL NOT NULL,
//     FOREIGN KEY (room_id) REFERENCES rooms(id)
//   );

//   CREATE TABLE IF NOT EXISTS bookings (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     student_id INTEGER NOT NULL,
//     promo_code_id INTEGER,
//     total_price REAL NOT NULL,
//     status TEXT CHECK(status IN ('active', 'cancelled')) DEFAULT 'active',
//     created_at TEXT DEFAULT (datetime('now')),
//     FOREIGN KEY (student_id) REFERENCES users(id),
//     FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id)
//   );

//   CREATE TABLE IF NOT EXISTS booking_rooms (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     booking_id INTEGER NOT NULL,
//     room_id INTEGER NOT NULL,
//     FOREIGN KEY (booking_id) REFERENCES bookings(id),
//     FOREIGN KEY (room_id) REFERENCES rooms(id)
//   );
// `);

db.exec(`
  INSERT INTO promo_codes (code, discount_type, discount_value) VALUES
  ('SAVE10', 'flat', 10.00),
  ('SAVE20', 'flat', 20.00),
  ('HALFOFF', 'percent', 50.00),
  ('STUDENT10', 'percent', 10.00),
  ('WELCOME5', 'flat', 5.00);
`)

console.log("Sample data inserted successfully");
