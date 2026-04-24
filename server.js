import express from "express";
import path from 'node:path';
import { authRouter } from "./routers/authRouter.js";
import { bookingRouter } from "./routers/bookings.js";
import { roomsRouter } from "./routers/rooms.js";
import { promoCodesRouter } from "./routers/promoCodes.js";

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
//Below code will serve static files once ready.
// app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/promo-codes", promoCodesRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
