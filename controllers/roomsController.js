import { db } from "../createTable.js";

//API endpoints for room related operations

//Get all rooms
export const getRooms = (req, res) => {
  const rooms = db.prepare("SELECT * FROM rooms").all();
  res.json(rooms);
};

//Get room by ID
export const getRoomById = (req, res) => {
  const { id } = req.params;
  const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(id);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: "Room not found" });
  }
};

//Create a new room
export const createRoom = (req, res) => {
  const { name, capacity } = req.body;
  const room = db
    .prepare("INSERT INTO rooms (name, capacity) VALUES (?, ?)")
    .run(name, capacity);
  res.status(201).json(room);
};

//Update a room
export const updateRoom = (req, res) => {
  const { id } = req.params;
  const { name, capacity } = req.body;
  const room = db
    .prepare("UPDATE rooms SET name = ?, capacity = ? WHERE id = ?")
    .run(name, capacity, id);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: "Room not found" });
  }
};

//Delete a room
export const deleteRoom = (req, res) => {
  const { id } = req.params;
  const room = db.prepare("DELETE FROM rooms WHERE id = ?").run(id);
  if (room) {
    res.json({ message: "Room deleted successfully" });
  } else {
    res.status(404).json({ error: "Room not found" });
  }
};

//API endpoints for booking room related operations
