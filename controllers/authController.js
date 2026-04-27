import { db } from "../createTable.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//API endpoints for authentication related operations
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

//Get all users
export const getUsers = (req, res) => {
  const users = db.prepare(`SELECT * FROM users`).all()
  res.status(200).json(users)
}

//Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    )
    .run(name, email, hashedPassword, role);
  res.status(201).json(user);
};

//Login a user
export const loginUser = async (req, res) => {
  const { email, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)

  if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
  }

  // Include userId so frontend can identify the logged-in user.
  // Keep id for backward compatibility with existing middleware.
  const token = jwt.sign({ id: user.id, userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
  res.json({ token, role: user.role, userId: user.id })
}

//Logout a user,
//Frontend needs to remove the token in localStorage.
export const logoutUser = (req, res) => {
    res.json({ message: "Logged out successfully" });
};

//API endpoints for user related operations

//Get currently logged-in user profile from token
export const getCurrentUser = (req, res) => {
  const currentUserId = req.user?.userId || req.user?.id;

  if (!currentUserId) {
    return res.status(401).json({ error: "Invalid token payload" });
  }

  const user = db
    .prepare("SELECT id, name, role FROM users WHERE id = ?")
    .get(currentUserId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
};
