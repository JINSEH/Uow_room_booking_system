# UOW Room Booking System

Backend API for a university room booking system: staff manage rooms and promo codes; students browse launched rooms and manage their bookings. Built for coursework (CSIT 214 IT Project Management).

## Tech stack

- **Node.js** with **ES modules** (`"type": "module"` in `package.json`)
- **Express 5** — HTTP API
- **better-sqlite3** — SQLite database (`database.db` in the project root)
- **bcrypt** — password hashing
- **jsonwebtoken** — login tokens for protected routes

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended, e.g. v18 or newer)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Database

The app uses `database.db` via `createTable.js`. If you are setting up from scratch, you need the SQLite tables (`users`, `rooms`, `bookings`, `promo_codes`, etc.) to exist. Example `CREATE TABLE` statements are in comments inside `createTable.js`; you can uncomment and run them once (e.g. with a small script that imports `db` and runs `db.exec(...)`), or restore a `database.db` file your team already prepared.

### 3. (Optional) Seed test data

Scripts under `test_data/` insert sample users, rooms, bookings, and promo codes. Run from the project root (order may matter if foreign keys reference other rows):

```bash
node test_data/seedUsers.js
node test_data/seedRooms.js
node test_data/seedPromoCodes.js
node test_data/seedBookings.js
```

Example seeded logins (see `test_data/seedUsers.js`): staff `terence@uow.edu.au`, student `edwin@uow.edu.au`, password `password123`.

### 4. Run the server

```bash
npm start
```

For auto-restart on file changes during development:

```bash
npx nodemon server.js
```

Default URL: **http://localhost:3000** (port is set in `server.js`).

## Postman collection

Ready-made requests for every endpoint live in this Postman collection (headers, bodies, and folders as you set them up):

[UOW Room Booking — Postman collection](https://web.postman.co/workspace/My-Workspace~27a9518d-c4f5-4902-8078-2c1e206498c7/collection/43814840-3840b6cb-0145-49b4-a262-58ff835b5142?action=share&source=copy-link&creator=43814840)

You usually need to be **signed in to Postman** for workspace links to open.

## Authentication

1. **Register** or **login** (see routes below).
2. For protected routes, send the JWT in the header:

   `Authorization: Bearer <your_token_here>`

Tokens are issued on login and include `id` and `role` (`staff` or `student`). Middleware enforces **staff-only** vs **student-only** routes.

> **Learning note:** The JWT signing secret is currently a fixed string in the code (`'secret'`). For a real production app you would read a strong secret from an environment variable and never commit it.

## API overview

Base path: `http://localhost:3000`

| Area | Method | Path | Access |
|------|--------|------|--------|
| Health | GET | `/` | Public |
| **Auth** | POST | `/api/auth/registerUser` | Public |
| | POST | `/api/auth/login` | Public |
| | GET | `/api/auth/logout` | Public (client discards token) |
| | GET | `/api/auth/all-users` | Staff + token |
| **Rooms** | GET | `/api/rooms/` | Staff + token |
| | GET | `/api/rooms/launched` | Public |
| | GET | `/api/rooms/draft` | Staff + token |
| | GET | `/api/rooms/:roomId` | Public |
| | POST | `/api/rooms/create-room` | Staff + token |
| | PUT | `/api/rooms/update-room/:roomId` | Staff + token |
| | DELETE | `/api/rooms/delete-room/:roomId` | Staff + token |
| **Bookings** | GET | `/api/booking/` | Student + token |
| | GET | `/api/booking/:bookingId` | Student + token |
| | POST | `/api/booking/create-booking` | Student + token |
| | PUT | `/api/booking/update-booking/:bookingId` | Student + token |
| | PUT | `/api/booking/cancel-booking/:bookingId` | Student + token |
| **Promo codes** | GET | `/api/promo-codes/` | Staff + token |
| | GET | `/api/promo-codes/:promoCodeId` | Staff + token |
| | POST | `/api/promo-codes/create-promo-code` | Staff + token |
| | PUT | `/api/promo-codes/update-promo-code/:promoCodeId` | Staff + token |
| | DELETE | `/api/promo-codes/delete-promo-code/:promoCodeId` | Staff + token |

Request bodies for register/login and CRUD operations match the fields used in the controllers (e.g. register: `name`, `email`, `password`, `role`).

## Project layout (high level)

- `server.js` — Express app entry, mounts routers
- `createTable.js` — opens `database.db` and exports `db`
- `routers/` — route definitions
- `controllers/` — request handlers and SQL
- `middleware/auth.js` — JWT verification and role checks
- `test_data/` — optional seed scripts

## Repository

- GitHub: https://github.com/JINSEH/Uow_room_booking_system

## License

ISC (see `package.json`).
