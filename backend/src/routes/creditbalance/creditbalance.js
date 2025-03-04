const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Ensure this route correctly handles fetching leave credits
router.get("/leave-credits/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Fetching leave credits for user ID:", userId); // Debugging

    const [rows] = await db.query(
      "SELECT credit_balance FROM users WHERE id = ?", 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ credit_balance: rows[0].credit_balance }); // Send only credit_balance
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
