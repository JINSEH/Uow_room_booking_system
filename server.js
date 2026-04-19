import express from "express";
import { authRouter } from "./routers/auth.js";
import { bookingRouter } from "./routers/bookings.js";
import { roomsRouter } from "./routers/rooms.js";
import { promoCodesRouter } from "./routers/promoCodes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
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
