import express from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomsController.js";

export const roomsRouter = express.Router();

roomsRouter.get("/", getRooms);
roomsRouter.get("/:roomId", getRoomById);
roomsRouter.post("/create-room", createRoom);
roomsRouter.put("/update-room/:roomId", updateRoom);
roomsRouter.delete("/delete-room/:roomId", deleteRoom);
