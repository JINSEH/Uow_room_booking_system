import { db } from "../createTable.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//API endpoints for authentication related operations

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

  // Include role in token so middleware can check it
  const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1h' })
  res.json({ token, role: user.role })
}

//Logout a user,
//Frontend needs to remove the token in localStorage.
export const logoutUser = (req, res) => {
    res.json({ message: "Logged out successfully" });
};

//API endpoints for user related operations
