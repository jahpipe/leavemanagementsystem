const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Fetch all leave balances
router.get("/leave-balance/all", async (req, res) => {
  try {
    const query = `
      SELECT elb.*, u.fullName, lt.name AS leaveTypeName
      FROM employee_leave_balances elb
      JOIN users u ON elb.user_id = u.id
      JOIN leave_types lt ON elb.leave_type_id = lt.id
    `;
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error("Error fetching all leave balances:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch all employees
router.get("/employees", async (req, res) => {
  try {
    const [results] = await db.execute("SELECT id, fullName FROM users");
    res.json(results);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch all leave types
router.get("/leave-types", async (req, res) => {
  try {
    const [results] = await db.execute("SELECT id, name FROM leave_types");
    res.json(results);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add leave credit (Update or Insert)
router.put("/leave-balance/add-credit", async (req, res) => {
  try {
    const { user_id, leave_type_id, creditsToAdd } = req.body;
    if (!user_id || !leave_type_id || creditsToAdd === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if balance exists
    const checkQuery = `
      SELECT * FROM employee_leave_balances WHERE user_id = ? AND leave_type_id = ?
    `;
    const [existingBalance] = await db.execute(checkQuery, [user_id, leave_type_id]);

    if (existingBalance.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE employee_leave_balances
        SET total_credit = total_credit + ?
        WHERE user_id = ? AND leave_type_id = ?
      `;
      await db.execute(updateQuery, [creditsToAdd, user_id, leave_type_id]);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO employee_leave_balances (user_id, leave_type_id, total_credit, used_credit)
        VALUES (?, ?, ?, 0)
      `;
      await db.execute(insertQuery, [user_id, leave_type_id, creditsToAdd]);
    }

    res.json({ message: "Leave credit added successfully" });
  } catch (error) {
    console.error("Error adding leave credit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete leave balance
router.delete("/leave-balance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM employee_leave_balances WHERE id = ?";
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave balance record not found" });
    }

    res.json({ message: "Leave balance deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch leave balances for a specific user
router.get("/leave-balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT elb.*, lt.name AS leaveTypeName
      FROM employee_leave_balances elb
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.user_id = ?
    `;
    const [results] = await db.execute(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No leave balances found for this user" });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching leave balances for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
