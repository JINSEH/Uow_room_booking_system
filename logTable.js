import Database from "better-sqlite3";

const db = new Database('database.db');

// const table = 'users';
// const table = 'rooms';
// const table = 'promo_codes';
// const table = 'bookings';
// const table = 'bookings_rooms';

//Check all tables in the database
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
console.log(tables);

//Check individual table
// const results = db.prepare(`SELECT * FROM ${table}`).all();
// console.log(results);