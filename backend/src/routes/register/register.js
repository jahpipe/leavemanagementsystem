const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

// MySQL Connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Register Employee Route
router.post("/", async (req, res) => {
  const { fullName, lastName, contact, username, password, role, credit_balance } = req.body;

  if (!["admin", "employee"].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Only "admin" or "employee" are allowed.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (fullName, lastName, contact, username, password, role, credit_balance) VALUES (?, ?, ?, ?, ?, ?, ?)";

    await db.query(query, [fullName, lastName, contact, username, hashedPassword, role, credit_balance || 0]); // Default to 0

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (err) {
    console.error("🔥 Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
