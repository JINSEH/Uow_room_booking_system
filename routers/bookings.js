import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingsController.js";
import express from "express";

export const bookingRouter = express.Router();

bookingRouter.get("/", getBookings);
bookingRouter.get("/:bookingId", getBookingById);
bookingRouter.post("/create-booking", createBooking);
bookingRouter.put("/update-booking/:bookingId", updateBooking);
bookingRouter.delete("/delete-booking/:bookingId", deleteBooking);
