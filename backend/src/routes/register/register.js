const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");


const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Register Employee Route
router.post("/", async (req, res) => {
  const {
    fullName,
    middleName,
    lastName,
    contact,
    username,
    password,
    role,
    position,
    salary,
    place_of_birth,
    date_of_birth,
    permanent_address,
    special_order_no,
    status_of_employment,
    effective_date,
    nature_of_appointment,
    school_assignment,
  } = req.body;

  // Role validation
  if (!["admin", "employee"].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Only "admin" or "employee" are allowed.' });
  }

  // Password validation
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  // Salary validation
  if (salary !== undefined && (isNaN(salary) || salary < 0)) {
    return res.status(400).json({ message: "Salary must be a positive number" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (
        fullName, middleName, lastName, contact, username, password, role, position, salary,
        place_of_birth, date_of_birth, permanent_address, special_order_no, 
        status_of_employment, effective_date, nature_of_appointment, school_assignment
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      fullName, middleName, lastName, contact, username, hashedPassword, role, position, salary,
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment,
    ]);

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
