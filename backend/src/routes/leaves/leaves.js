const express = require("express");
const mysql = require("mysql2/promise"); 
const router = express.Router();


const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: 3306, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


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


    if (!user_id || !Array.isArray(leave_types) || leave_types.length === 0 || !Array.isArray(leave_dates) || leave_dates.length === 0) {
      return res.status(400).json({ error: "user_id, at least one leave_type, and at least one leave_date are required" });
    }


    const [result] = await connection.execute(
      `INSERT INTO leave_applications 
      (user_id, other_leave_type, leave_details, number_of_days, location, abroad_details, illness_details, study_leave, monetization, commutation, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, other_leave_type || null, leave_details || null, number_of_days || null, location || null, abroad_details || null, illness_details || null, study_leave, monetization, commutation, status]
    );

    const leave_application_id = result.insertId;


    if (leave_types.length > 0) {
      const leaveTypeValues = leave_types.map((leaveTypeId) => [leave_application_id, leaveTypeId]);
      await connection.query(`INSERT INTO leave_application_types (leave_application_id, leave_type_id) VALUES ?`, [leaveTypeValues]);
    }

  
    if (leave_dates.length > 0) {
      const leaveDateValues = leave_dates.map((date) => [leave_application_id, date]);
      await connection.query(`INSERT INTO leave_dates (leave_application_id, leave_date) VALUES ?`, [leaveDateValues]);
    }

    await connection.commit();
    res.status(201).json({ message: "Leave application submitted successfully", leave_application_id });

  } catch (error) {
    if (connection) await connection.rollback(); 
    console.error("Error submitting leave application:", error);
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release(); 
  }
});


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


    results.forEach((row) => {
      row.leave_dates = row.leave_dates ? row.leave_dates.split(",") : [];
      row.leave_types = row.leave_types ? row.leave_types.split(",") : [];
    });

    res.json(results);

  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release(); 
  }
});


router.delete("/delete-leave/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete leave ID: ${id}`);

  try {
      const [leaveRequest] = await db.execute(
          "SELECT * FROM leave_applications WHERE id = ? AND status = 'Pending'",
          [id]
      );

      if (leaveRequest.length === 0) {
          console.log("Leave request not found or not pending.");
          return res.status(400).json({ error: "Leave request not found or not pending." });
      }

    
      await db.execute("DELETE FROM leave_applications WHERE id = ?", [id]);

      console.log("Leave request deleted successfully.");
      res.json({ message: "Leave request deleted successfully." });
  } catch (error) {
      console.error("Error deleting leave request:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
