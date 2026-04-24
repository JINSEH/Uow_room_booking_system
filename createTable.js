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

// CREATE TABLE IF NOT EXISTS bookings (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     student_id INTEGER NOT NULL,
//     room_id INTEGER NOT NULL,
//     promo_code_id INTEGER,
//     total_price REAL NOT NULL,
//     status TEXT CHECK(status IN ('active', 'cancelled')) DEFAULT 'active',
//     created_at TEXT DEFAULT (datetime('now')),
//     FOREIGN KEY (student_id) REFERENCES users(id),
//     FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
//     FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id)
//  );
//`);


// db.prepare('DELETE FROM rooms;').run()
// console.log("Table dropped successfully and new table created successfully");
