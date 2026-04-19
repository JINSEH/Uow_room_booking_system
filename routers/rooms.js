import express from "express";
import {
  getRooms,
  getDraftedRooms,
  getLaunchedRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomsController.js";
import { authenticateToken, requireStaff } from "../middleware/auth.js";

export const roomsRouter = express.Router();

roomsRouter.get("/", authenticateToken, requireStaff, getRooms);
roomsRouter.get("/draft", authenticateToken, requireStaff, getDraftedRooms);
roomsRouter.get("/launched", getLaunchedRooms);
roomsRouter.get("/:roomId", getRoomById);
roomsRouter.post("/create-room", authenticateToken, requireStaff, createRoom);
roomsRouter.put("/update-room/:roomId", authenticateToken, requireStaff, updateRoom);
roomsRouter.delete("/delete-room/:roomId", authenticateToken, requireStaff, deleteRoom);
