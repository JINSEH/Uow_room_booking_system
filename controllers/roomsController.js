import { db } from "../createTable.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

//API endpoints for room related operations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "..", "public", "images", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

//Get all rooms
export const getRooms = (req, res) => {
  const rooms = db.prepare("SELECT * FROM rooms").all();
  res.json(rooms);
};


//Get rooms that are already launched and not booked
export const getLaunchedRooms = (req, res) => {
  const { name, min_price, max_price, capacity, date } = req.query

  let query = `SELECT * FROM rooms WHERE status = ? AND id NOT IN (
      SELECT room_id FROM bookings WHERE status = 'active'
  )`
  const params = ["launched"]

  if (name) {
      query += ' AND name LIKE ?'
      params.push(`%${name}%`)
  }

  if (min_price) {
      query += ' AND price >= ?'
      params.push(min_price)
  }

  if (max_price) {
      query += ' AND price <= ?'
      params.push(max_price)
  }

  if (capacity) {
      query += ' AND capacity >= ?'
      params.push(capacity)
  }

  if (date) {
      query += ' AND date = ?'
      params.push(date)
  }

  const rooms = db.prepare(query).all(params)
  res.json(rooms)
}

//Get rooms that are drafted
export const getDraftedRooms = (req, res) => {
  const staffId = req.user?.userId || req.user?.id;
  const rooms = db
    .prepare(`SELECT * FROM rooms WHERE status = ? AND created_by = ?`)
    .all("draft", staffId);
  res.json(rooms)
}

//Get room by ID
export const getRoomById = (req, res) => {
  const { roomId } = req.params;
  const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: "Room not found" });
  }
};

//Upload room image and return public path
export const uploadRoomImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "image file is required" });
  }

  const imagePath = `../images/uploads/${req.file.filename}`;
  res.status(201).json({ imagePath });
};

//Create a new room
export const createRoom = (req, res) => {
  const { name, capacity, price, description, location, image } = req.body
  const created_by = req.user.id 
  const status = "launched";

  // Check all required fields
  if (!name || !capacity || !price || !description || !location || !image) {
      return res.status(400).json({ error: 'name, capacity, price, description, location and image are required' })
  }

  const room = db.prepare(`
      INSERT INTO rooms (name, capacity, price, description, location, image, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, capacity, price, description, location, image, status, created_by)

  res.status(201).json({ message: 'Room created', roomId: room.lastInsertRowid })
}

//Update a room
export const updateRoom = (req, res) => {
  const { roomId } = req.params
  const { name, capacity, price, description, location, image } = req.body

  // Check if room exists
  const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)
  if (!existing) {
      return res.status(404).json({ error: 'Room not found' })
  }

  const result = db.prepare(`
      UPDATE rooms 
      SET 
          name = ?,
          capacity = ?,
          price = ?,
          description = ?,
          location = ?,
          image = ?
      WHERE id = ?
  `).run(
      name ?? existing.name,
      capacity ?? existing.capacity,
      price ?? existing.price,
      description ?? existing.description,
      location ?? existing.location,
      image ?? existing.image,
      roomId
  )

  if (result.changes === 0) {
      return res.status(404).json({ error: 'Room not found' })
  }

  const updatedRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)
  res.json(updatedRoom)
}

//Delete a room
export const deleteRoom = (req, res) => {
  const { roomId } = req.params;
  const room = db.prepare("DELETE FROM rooms WHERE id = ?").run(roomId);
  if (room) {
    res.json({ message: "Room deleted successfully" });
  } else {
    res.status(404).json({ error: "Room not found" });
  }
};

//API endpoints for booking room related operations
