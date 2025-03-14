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

// GET /api/leaveapproval/:status
router.get("/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update the query to also select other_leave_type
    const query = `
  SELECT 
    la.id, 
    la.user_id, 
    la.leave_details, 
    la.other_leave_type, 
    la.status, 
    la.created_at, 
    u.fullName, 
    u.lastName, 
    u.middleName,
    u.position,
    u.salary,
    GROUP_CONCAT(DISTINCT lt.name) AS leave_types, 
    GROUP_CONCAT(DISTINCT DATE_FORMAT(ld.leave_date, '%Y-%m-%d')) AS leave_dates
  FROM leave_applications la
  LEFT JOIN users u ON la.user_id = u.id
  LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
  LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
  LEFT JOIN leave_dates ld ON la.id = ld.leave_application_id
  WHERE la.status = ?
  GROUP BY la.id
  ORDER BY la.created_at DESC
  LIMIT ? OFFSET ?`;

    const [results] = await db.execute(query, [status, limit, offset]);

    // Combine the aggregated leave_types with other_leave_type if it exists
    const formattedResults = results.map(row => {
      const types = row.leave_types ? row.leave_types.split(",") : [];
      if (row.other_leave_type) {
        types.push(row.other_leave_type);
      }
      return {
        ...row,
        leave_types: types,
        leave_dates: row.leave_dates ? row.leave_dates.split(",") : []
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// PUT /api/leaveapproval/:id/update
router.put("/:id/update", async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    status = status.toLowerCase();

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = `UPDATE leave_applications SET status = ? WHERE id = ?`;
    const [result] = await db.execute(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
