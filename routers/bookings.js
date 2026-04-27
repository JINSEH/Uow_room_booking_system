import {
  getBookings,
  getBookingById,
  createBooking,
  getBookingQuote,
  updateBooking,
  cancelBooking,
  cancelBookingGroup,
  getUnavailableSlots,
} from "../controllers/bookingsController.js";
import express from "express";
import { authenticateToken, requireStudent, requireStudentOrStaff } from "../middleware/auth.js";

export const bookingRouter = express.Router();

bookingRouter.get("/", authenticateToken, requireStudent, getBookings);
bookingRouter.get("/unavailable-slots/:roomName", authenticateToken, requireStudentOrStaff, getUnavailableSlots);
bookingRouter.post("/quote", authenticateToken, requireStudentOrStaff, getBookingQuote);
bookingRouter.get("/:bookingId", authenticateToken, requireStudent, getBookingById);
bookingRouter.post("/create-booking", authenticateToken, requireStudentOrStaff, createBooking);
bookingRouter.put("/update-booking/:bookingId", authenticateToken, requireStudent, updateBooking);
bookingRouter.put("/cancel-booking/:bookingId", authenticateToken, requireStudent, cancelBooking);
bookingRouter.put("/cancel-booking-group/:bookingGroupId", authenticateToken, requireStudent, cancelBookingGroup);
