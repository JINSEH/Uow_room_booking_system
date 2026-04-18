import { db } from "../createTable.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//API endpoints for authentication related operations
//Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = db
    .prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    )
    .run(name, email, hashedPassword, role);
  res.status(201).json(user);
};

//Login a user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
  res.json({ token, user });
};

//Logout a user
export const logoutUser = (req, res) => {
  const { token } = req.body;
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.json({ message: "Logged out successfully" });
  });
};

//API endpoints for user related operations
