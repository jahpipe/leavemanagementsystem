const express = require("express");
const mysql = require("mysql2/promise"); // ✅ Use `mysql2/promise` for async/await
const router = express.Router();

// ✅ MySQL Connection Pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: 3306, // Use number, not string
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Apply Leave Request
router.post("/apply-leave", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      user_id,
      leave_types,
      other_leave_type,
      leave_details,
      number_of_days,
      location,
      abroad_details,
      illness_details,
      study_leave = false,
      monetization = false,
      commutation = false,
      status = "Pending",
      leave_dates,
    } = req.body;

    // ✅ Input Validation
    if (!user_id || !Array.isArray(leave_types) || leave_types.length === 0 || !Array.isArray(leave_dates) || leave_dates.length === 0) {
      return res.status(400).json({ error: "user_id, at least one leave_type, and at least one leave_date are required" });
    }

    // ✅ Insert Leave Application
    const [result] = await connection.execute(
      `INSERT INTO leave_applications 
      (user_id, other_leave_type, leave_details, number_of_days, location, abroad_details, illness_details, study_leave, monetization, commutation, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, other_leave_type || null, leave_details || null, number_of_days || null, location || null, abroad_details || null, illness_details || null, study_leave, monetization, commutation, status]
    );

    const leave_application_id = result.insertId;

    // ✅ Insert Leave Types
    if (leave_types.length > 0) {
      const leaveTypeValues = leave_types.map((leaveTypeId) => [leave_application_id, leaveTypeId]);
      await connection.query(`INSERT INTO leave_application_types (leave_application_id, leave_type_id) VALUES ?`, [leaveTypeValues]);
    }

    // ✅ Insert Leave Dates
    if (leave_dates.length > 0) {
      const leaveDateValues = leave_dates.map((date) => [leave_application_id, date]);
      await connection.query(`INSERT INTO leave_dates (leave_application_id, leave_date) VALUES ?`, [leaveDateValues]);
    }

    await connection.commit();
    res.status(201).json({ message: "Leave application submitted successfully", leave_application_id });

  } catch (error) {
    if (connection) await connection.rollback(); // Rollback on error
    console.error("Error submitting leave application:", error);
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release(); // ✅ Always release the connection
  }
});

// ✅ Fetch Leave Requests
router.get("/leave-requests/:userId", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const userId = req.params.userId;

    const query = `
      SELECT la.*, 
          GROUP_CONCAT(DISTINCT DATE_FORMAT(lad.leave_date, '%Y-%m-%d')) AS leave_dates,
          GROUP_CONCAT(DISTINCT lt.name) AS leave_types
      FROM leave_applications la
      LEFT JOIN leave_dates lad ON la.id = lad.leave_application_id
      LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
      LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
      WHERE la.user_id = ?
      GROUP BY la.id
      ORDER BY MIN(lad.leave_date) ASC
    `;

    const [results] = await connection.execute(query, [userId]);

    // ✅ Convert comma-separated string back to an array
    results.forEach((row) => {
      row.leave_dates = row.leave_dates ? row.leave_dates.split(",") : [];
      row.leave_types = row.leave_types ? row.leave_types.split(",") : [];
    });

    res.json(results);

  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release(); // ✅ Always release connection
  }
});


module.exports = router;
