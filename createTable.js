import Database from "better-sqlite3";

export const db = new Database("database.db");

// // db.exec(`
// //   CREATE TABLE IF NOT EXISTS users (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     name TEXT NOT NULL,
// //     email TEXT UNIQUE NOT NULL,
// //     password_hash TEXT NOT NULL,
// //     role TEXT CHECK(role IN ('staff', 'student')) NOT NULL
// //   );

// //   CREATE TABLE IF NOT EXISTS rooms (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     name TEXT NOT NULL,
// //     capacity INTEGER NOT NULL,
// //     price REAL NOT NULL,
// //     status TEXT CHECK(status IN ('draft', 'launched')) DEFAULT 'draft',
// //     created_by INTEGER NOT NULL,
// //     FOREIGN KEY (created_by) REFERENCES users(id)
// //   );

// //   CREATE TABLE IF NOT EXISTS promo_codes (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     room_id INTEGER NOT NULL,
// //     code TEXT UNIQUE NOT NULL,
// //     discount_type TEXT CHECK(discount_type IN ('flat', 'percent')) NOT NULL,
// //     discount_value REAL NOT NULL,
// //     FOREIGN KEY (room_id) REFERENCES rooms(id)
// //   );

// //   CREATE TABLE IF NOT EXISTS bookings (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     booking_group_id TEXT,
// //     student_id INTEGER NOT NULL,
// //     room_id INTEGER NOT NULL,
// //     promo_code_id INTEGER,
// //     booking_date TEXT,
// //     start_time TEXT,
// //     end_time TEXT,
// //     total_price REAL NOT NULL,
// //     status TEXT CHECK(status IN ('active', 'cancelled')) DEFAULT 'active',
// //     created_at TEXT DEFAULT (datetime('now')),
// //     FOREIGN KEY (student_id) REFERENCES users(id),
// //     FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
// //     FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id)
// //   );
// // `);

// // const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
// // const bookingColumnNames = new Set(bookingColumns.map((column) => column.name));

// // if (!bookingColumnNames.has("booking_date")) {
// //   db.exec("ALTER TABLE bookings ADD COLUMN booking_date TEXT");
// // }
// // if (!bookingColumnNames.has("booking_group_id")) {
// //   db.exec("ALTER TABLE bookings ADD COLUMN booking_group_id TEXT");
// // }
// // if (!bookingColumnNames.has("start_time")) {
// //   db.exec("ALTER TABLE bookings ADD COLUMN start_time TEXT");
// // }
// // if (!bookingColumnNames.has("end_time")) {
// //   db.exec("ALTER TABLE bookings ADD COLUMN end_time TEXT");
// // }

// db.prepare("DELETE FROM bookings").run();

// // const roomColumns = db.prepare("PRAGMA table_info(rooms)").all();
// // const roomColumnNames = new Set(roomColumns.map((column) => column.name));

// // if (!roomColumnNames.has("description")) {
// //   db.exec("ALTER TABLE rooms ADD COLUMN description TEXT DEFAULT ''");
// // }
// // if (!roomColumnNames.has("location")) {
// //   db.exec("ALTER TABLE rooms ADD COLUMN location TEXT DEFAULT ''");
// // }

// db.prepare("DELETE FROM promo_codes").run();
// db.prepare("DELETE FROM rooms").run();

// const roomColumns = db.prepare("PRAGMA table_info(rooms)").all();
// const roomColumnNames = new Set(roomColumns.map((column) => column.name));

// if (!roomColumnNames.has("description")) {
//   db.exec("ALTER TABLE rooms ADD COLUMN description TEXT DEFAULT ''");
// }
// if (!roomColumnNames.has("location")) {
//   db.exec("ALTER TABLE rooms ADD COLUMN location TEXT DEFAULT ''");
// }
// if (!roomColumnNames.has("image")) {
//   db.exec("ALTER TABLE rooms ADD COLUMN image TEXT DEFAULT ''");
// }

// Ensure promo_codes is global (not tied to a room).
// If an older schema still has room_id, migrate to the new structure.
// const promoTable = db
//   .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'promo_codes'")
//   .get();

// if (!promoTable) {
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS promo_codes (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       code TEXT UNIQUE NOT NULL,
//       discount_type TEXT CHECK(discount_type IN ('flat', 'percent')) NOT NULL,
//       discount_value REAL NOT NULL
//     );
//   `);
// } else {
//   const promoColumns = db.prepare("PRAGMA table_info(promo_codes)").all();
//   const hasRoomId = promoColumns.some((column) => column.name === "room_id");

//   if (hasRoomId) {
//     db.exec("PRAGMA foreign_keys = OFF");

//     const migratePromoCodes = db.transaction(() => {
//       db.exec(`
//         CREATE TABLE promo_codes_new (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           code TEXT UNIQUE NOT NULL,
//           discount_type TEXT CHECK(discount_type IN ('flat', 'percent')) NOT NULL,
//           discount_value REAL NOT NULL
//         );
//       `);

//       db.exec(`
//         INSERT INTO promo_codes_new (id, code, discount_type, discount_value)
//         SELECT id, code, discount_type, discount_value
//         FROM promo_codes;
//       `);

//       db.exec("DROP TABLE promo_codes");
//       db.exec("ALTER TABLE promo_codes_new RENAME TO promo_codes");
//     });

//     try {
//       migratePromoCodes();
//     } finally {
//       db.exec("PRAGMA foreign_keys = ON");
//     }
//   }
// }