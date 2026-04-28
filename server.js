import "dotenv/config";
import express from "express";
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { authRouter } from "./routers/authRouter.js";
import { bookingRouter } from "./routers/bookings.js";
import { roomsRouter } from "./routers/rooms.js";
import { promoCodesRouter } from "./routers/promoCodes.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/promo-codes", promoCodesRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "uow-room-booking-system" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
