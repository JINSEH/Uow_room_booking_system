import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingsController.js";
import express from "express";
import { authenticateToken, requireStudent } from "../middleware/auth.js";

export const bookingRouter = express.Router();

bookingRouter.get("/", authenticateToken, requireStudent, getBookings);
bookingRouter.get("/:bookingId", authenticateToken, requireStudent, getBookingById);
bookingRouter.post("/create-booking", authenticateToken, requireStudent, createBooking);
bookingRouter.put("/update-booking/:bookingId", authenticateToken, requireStudent, updateBooking);
bookingRouter.delete("/delete-booking/:bookingId", authenticateToken, requireStudent, deleteBooking);
