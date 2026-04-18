import express from "express";
import { authRouter } from "./routers/auth";
import { bookingRouter } from "./routers/bookings";
import { roomsRouter } from "./routers/rooms";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/rooms", roomsRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
