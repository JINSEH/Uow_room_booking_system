# UOW Room Booking System

Full-stack university room booking system for CSIT 214.  
The same Express app serves both:

- frontend pages from `public/`
- backend APIs from `routers/` and `controllers/`

Students can browse and book rooms. Staff can create, update, delete, reserve rooms, and upload room images.

## Tech stack

- Node.js (ES modules)
- Express 5
- SQLite (`better-sqlite3`)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- File uploads (`multer`)
- Environment variables (`dotenv`)

## Prerequisites

- Node.js 18+ (Node 22 recommended)

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy example config:

```bash
cp .env.example .env
```

Then update `.env`:

```env
PORT=3000
JWT_SECRET=your-very-long-random-secret
```

### 3) Database and schema

Database file: `database.db` (project root).  
Schema migrations for room columns (`description`, `location`, `image`) are handled in `createTable.js`.

### 4) (Optional) Seed test data

```bash
node test_data/seedUsers.js
node test_data/seedRooms.js
node test_data/seedPromoCodes.js
node test_data/seedBookings.js
```

### 5) Run app

```bash
npm start
```

Development mode:

```bash
npx nodemon server.js
```

Open: [http://localhost:3000](http://localhost:3000)

## Core pages

- Student rooms: `/html/rooms_student_view.html`
- Staff rooms: `/html/rooms_staff_view.html`
- Staff create room: `/html/create_room_staff.html`

## Health check

- `GET /health`  
Returns service status JSON.

## Authentication

Use login/register endpoints, then pass token:

`Authorization: Bearer <token>`

Token payload includes:

- `id` / `userId`
- `role` (`student` or `staff`)

## API quick overview

### Auth

- `POST /api/auth/registerUser`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/all-users` (staff)

### Rooms

- `GET /api/rooms/launched` (public)
- `GET /api/rooms/draft` (staff)
- `POST /api/rooms/upload-image` (staff, multipart form-data `image`)
- `POST /api/rooms/create-room` (staff)
- `PUT /api/rooms/update-room/:roomId` (staff)
- `DELETE /api/rooms/delete-room/:roomId` (staff)

### Booking

- `GET /api/booking/unavailable-slots/:roomName` (student or staff)
- `POST /api/booking/create-booking` (student or staff)
- `GET /api/booking` (student)
- `PUT /api/booking/cancel-booking/:bookingId` (student)
- `PUT /api/booking/cancel-booking-group/:bookingGroupId` (student)

### Promo codes

- `GET /api/promo-codes`
- `POST /api/promo-codes/create-promo-code`
- `PUT /api/promo-codes/update-promo-code/:promoCodeId`
- `DELETE /api/promo-codes/delete-promo-code/:promoCodeId`

## Project structure

- `server.js` - app entry point, route mounting, static hosting
- `createTable.js` - DB connection and lightweight schema migration
- `controllers/` - business logic and SQL operations
- `routers/` - API route registration
- `middleware/` - auth and role guards
- `public/` - frontend HTML/CSS/JS and uploaded room images
- `test_data/` - optional seed scripts
- `DEPLOYMENT.md` - deployment guide for VPS sharing
- `deploy.sh` - quick redeploy script (PM2-based)

## Deploy for teammate sharing

Use the instructions in `DEPLOYMENT.md`.  
Recommended: VPS + PM2 + Nginx, so teammates can access one shared URL and one shared `database.db`.

## License

ISC
