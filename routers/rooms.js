import express from "express";
import {
  getRooms,
  getDraftedRooms,
  getLaunchedRooms,
  getRoomById,
  uploadRoomImage,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomsController.js";
import { authenticateToken, requireStaff } from "../middleware/auth.js";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const roomsRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "..", "public", "images", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDirectory),
    filename: (_req, file, cb) => {
      const safeOriginalName = String(file.originalname || "room-image")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.\-_]/g, "");
      cb(null, `${Date.now()}-${safeOriginalName}`);
    },
  }),
});

roomsRouter.get("/", authenticateToken, requireStaff, getRooms);
roomsRouter.get("/launched", getLaunchedRooms);
roomsRouter.get("/draft", authenticateToken, requireStaff, getDraftedRooms);
roomsRouter.get("/:roomId", getRoomById);
roomsRouter.post("/upload-image", authenticateToken, requireStaff, upload.single("image"), uploadRoomImage);
roomsRouter.post("/create-room", authenticateToken, requireStaff, createRoom);
roomsRouter.put("/update-room/:roomId", authenticateToken, requireStaff, updateRoom);
roomsRouter.delete("/delete-room/:roomId", authenticateToken, requireStaff, deleteRoom);
