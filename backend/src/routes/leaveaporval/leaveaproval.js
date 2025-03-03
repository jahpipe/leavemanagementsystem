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

// ✅ Generic function to fetch leave applications by status with pagination
const getLeaveApplicationsByStatus = async (status, limit, offset) => {
  const query = `
    SELECT la.*, u.fullName, u.lastName 
    FROM leave_applications la
    JOIN users u ON la.user_id = u.id
    WHERE la.status = ?
    LIMIT ? OFFSET ?
  `;

  const [results] = await db.query(query, [status, limit, offset]);

  return results.map(item => ({
    ...item,
    leave_types: item.leave_types ? JSON.parse(item.leave_types) : [],
  }));
};

// ✅ Fetch leave applications with pagination
router.get("/:status", async (req, res) => {
  const { status } = req.params;
  const validStatuses = ["pending", "approved", "rejected"];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ error: "Invalid status type" });
  }

  try {
    const results = await getLeaveApplicationsByStatus(status.charAt(0).toUpperCase() + status.slice(1), limit, offset);
    res.json(results);
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
