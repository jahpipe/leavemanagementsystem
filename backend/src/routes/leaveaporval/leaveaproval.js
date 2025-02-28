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

// ✅ Get all pending leave applications with fullName and lastName
router.get("/pending", async (req, res) => {
  try {
    const query = `
      SELECT la.*, u.fullName, u.lastName 
      FROM leave_applications la
      JOIN users u ON la.user_id = u.id
      WHERE la.status = 'Pending'
    `;

    const [results] = await db.query(query);

    // ✅ Ensure leave_types is properly parsed
    const formattedResults = results.map(item => ({
      ...item,
      leave_types: item.leave_types ? JSON.parse(item.leave_types) : [],
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching leave applications:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update leave application status (Approve/Reject)
router.put("/:id/update", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [result] = await db.query("UPDATE leave_applications SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave application not found" });
    }

    res.json({ message: `Leave application ${status.toLowerCase()} successfully!` });
  } catch (err) {
    console.error("Error updating leave application:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
