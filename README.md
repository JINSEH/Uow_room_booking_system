# UOW Room Booking System

A full-stack room booking website for the CSIT 214 project.  
This project runs locally and uses one Express app to serve both frontend pages and backend APIs.

## How the website works

### 1) User roles
- **Students** can browse available rooms, check unavailable time slots, and create or cancel bookings.
- **Staff** can do booking actions and also manage rooms (create, update, delete, launch/draft) and upload room images.

### 2) Frontend flow
- The frontend is built with static HTML, CSS, and JavaScript in `public/`.
- Pages send requests to backend API routes (for login, room data, booking data, and promo codes).
- The same server also serves uploaded room images from `public/uploads/`.

### 3) Backend flow
- `server.js` starts the Express server and mounts all routes.
- Routes in `routers/` receive requests and call controllers in `controllers/`.
- Controllers run SQL operations through `better-sqlite3` to read/write `database.db`.
- Middleware in `middleware/` validates JWT tokens and checks user roles for protected endpoints.

### 4) Authentication and authorization
- Users register/login through auth endpoints.
- On login, the server returns a JWT token.
- Protected requests include: `Authorization: Bearer <token>`.
- Role checks (`student` / `staff`) control access to staff-only features.

### 5) Booking logic (high level)
- A user selects a room and date/time.
- The system checks unavailable slots for that room.
- If the slot is valid, a booking is created and saved in the database.
- Users can view and cancel their own bookings.

## Tech stack

- **Runtime:** Node.js (ES Modules)
- **Web framework:** Express 5
- **Database:** SQLite with `better-sqlite3`
- **Authentication:** JWT (`jsonwebtoken`)
- **Password security:** `bcrypt`
- **File upload:** `multer`
- **Environment config:** `dotenv`
- **Dev tooling:** `nodemon`

## Run locally

### Prerequisites
- Node.js 18+ (Node 22 recommended)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and set:
   ```env
   PORT=3000
   JWT_SECRET=your-very-long-random-secret
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Development mode (auto-restart):
   ```bash
   npx nodemon server.js
   ```

Open [http://localhost:3000](http://localhost:3000)

## Project structure

- `server.js` - app entry point and route mounting
- `createTable.js` - database setup and schema updates
- `routers/` - API endpoints
- `controllers/` - application logic and database operations
- `middleware/` - auth and role checks
- `public/` - frontend pages/assets and uploaded room images
- `test_data/` - optional data seeding scripts

## License

ISC
