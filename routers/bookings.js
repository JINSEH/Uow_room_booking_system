import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
} from "../controllers/bookingsController.js";
import express from "express";
import { authenticateToken, requireStudent } from "../middleware/auth.js";

export const bookingRouter = express.Router();

bookingRouter.get("/", authenticateToken, requireStudent, getBookings);
bookingRouter.get("/:bookingId", authenticateToken, requireStudent, getBookingById);
bookingRouter.post("/create-booking", authenticateToken, requireStudent, createBooking);
bookingRouter.put("/update-booking/:bookingId", authenticateToken, requireStudent, updateBooking);
bookingRouter.delete("/cancel-booking/:bookingId", authenticateToken, requireStudent, cancelBooking);
