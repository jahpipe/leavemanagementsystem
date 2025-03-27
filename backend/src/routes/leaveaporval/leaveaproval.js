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

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = `
      SELECT 
        la.id, 
        la.user_id, 
        la.leave_details, 
        la.other_leave_type, 
        la.status, 
        la.rejection_message, 
        la.created_at, 
        u.fullName, 
        u.lastName, 
        u.middleName,
        u.position,
        u.salary,
        u.school_assignment,
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

    const formattedResults = results.map(row => {
      const types = row.leave_types ? row.leave_types.split(",") : [];
      if (row.other_leave_type) {
        types.push(row.other_leave_type);
      }
      return {
        ...row,
        leave_types: types,
        leave_dates: row.leave_dates ? row.leave_dates.split(",") : [],
        rejection_message: row.rejection_message || ""
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
    let { status, rejection_message } = req.body;
    status = status.toLowerCase();

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = `UPDATE leave_applications SET status = ?, rejection_message = ? WHERE id = ?`;
    const [result] = await db.execute(query, [status, rejection_message || "", id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/leaveapproval/:id/sendmessage
router.post("/:id/sendmessage", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const query = `UPDATE leave_applications SET status = 'rejected', rejection_message = ? WHERE id = ?`;
    const [result] = await db.execute(query, [message, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json({ message: "Leave request rejected successfully with message" });
  } catch (error) {
    console.error("Error sending rejection message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leave-balances/:userId", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const userId = req.params.userId;

    // Fetch all leave balances for the user
    const [balances] = await connection.execute(
      `SELECT 
        lt.name AS leave_type_name,
        elb.total_credit,
        elb.used_credit,
        elb.remaining_credit
      FROM employee_leave_balances elb
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.user_id = ?`,
      [userId]
    );

    // Transform the data into a more frontend-friendly format
    const transformedBalances = balances.reduce((acc, balance) => {
      acc[balance.leave_type_name.replace(/\s+/g, '_').toLowerCase()] = {
        total_credit: balance.total_credit,
        used_credit: balance.used_credit,
        remaining_credit: balance.remaining_credit
      };
      return acc;
    }, {});

    res.json(transformedBalances);

  } catch (error) {
    console.error("Error fetching leave balances:", error);
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
