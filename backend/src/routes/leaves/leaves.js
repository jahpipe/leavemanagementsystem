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
      particulars // Added for manual notes
    } = req.body;

    // Validate required fields
    if (!user_id || !Array.isArray(leave_types) || leave_types.length === 0 || 
        !Array.isArray(leave_dates) || leave_dates.length === 0) {
      return res.status(400).json({ 
        error: "user_id, at least one leave_type, and at least one leave_date are required" 
      });
    }

    // Format and validate leave dates
    const formattedLeaveDates = leave_dates.map(date => {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date format: ${date}`);
      }
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    // Check leave balances before proceeding
    const [balances] = await connection.execute(
      `SELECT leave_type_id, total_credit, used_credit, remaining_credit 
       FROM employee_leave_balances 
       WHERE user_id = ? AND leave_type_id IN (?)`,
      [user_id, leave_types]
    );

    // Verify sufficient balance for all leave types
    const balanceMap = {};
    balances.forEach(balance => {
      balanceMap[balance.leave_type_id] = balance.remaining_credit;
    });

    for (const leaveTypeId of leave_types) {
      if (!balanceMap[leaveTypeId] || balanceMap[leaveTypeId] < number_of_days) {
        throw new Error(`Insufficient leave balance for leave type: ${leaveTypeId}`);
      }
    }

    // Insert leave application
    const [result] = await connection.execute(
      `INSERT INTO leave_applications 
       (user_id, other_leave_type, leave_details, number_of_days, location, 
        abroad_details, illness_details, study_leave, monetization, commutation, 
        status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id, 
        other_leave_type || null, 
        leave_details || null, 
        number_of_days, 
        location || null, 
        abroad_details || null, 
        illness_details || null, 
        study_leave, 
        monetization, 
        commutation, 
        status
      ]
    );

    const leave_application_id = result.insertId;

    // Insert leave types
    if (leave_types.length > 0) {
      const leaveTypeValues = leave_types.map(leaveTypeId => [leave_application_id, leaveTypeId]);
      await connection.query(
        `INSERT INTO leave_application_types (leave_application_id, leave_type_id) VALUES ?`,
        [leaveTypeValues]
      );
    }

    // Insert leave dates
    if (formattedLeaveDates.length > 0) {
      const leaveDateValues = formattedLeaveDates.map(date => [leave_application_id, date]);
      await connection.query(
        `INSERT INTO leave_dates (leave_application_id, leave_date) VALUES ?`,
        [leaveDateValues]
      );
    }

    // Update leave balances with particulars and dates
    const latestLeaveDate = new Date(Math.max(...formattedLeaveDates.map(d => new Date(d))));
    
    for (const leaveTypeId of leave_types) {
      await connection.execute(
        `UPDATE employee_leave_balances 
         SET used_credit = used_credit + ?,
             remaining_credit = remaining_credit - ?,
             last_application_date = ?,
             particulars = COALESCE(?, particulars),
             recorded_date = NOW()
         WHERE user_id = ? AND leave_type_id = ?`,
        [
          number_of_days,
          number_of_days,
          latestLeaveDate,
          particulars, // Will keep existing if null is provided
          user_id,
          leaveTypeId
        ]
      );
    }

    await connection.commit();
    
    res.status(201).json({ 
      message: "Leave application submitted successfully",
      leave_application_id,
      updated_balances: balances.map(b => ({
        leave_type_id: b.leave_type_id,
        new_balance: b.remaining_credit - number_of_days
      }))
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error submitting leave application:", error);
    res.status(500).json({ 
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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


// Add this to your router file where you have other leave-related routes
router.put("/cancel-leave/:id", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const leaveId = req.params.id;
    const { user_id } = req.body;

    console.log(`Attempting to cancel leave ${leaveId} for user ${user_id}`);

    if (!user_id) {
      console.error("User ID is required");
      return res.status(400).json({ error: "User ID is required" });
    }

    // 1. Verify leave request exists and is pending
    const [leaveRequests] = await connection.query(
      `SELECT la.id, la.number_of_days, la.status
       FROM leave_applications la
       WHERE la.id = ? AND la.user_id = ? AND la.status = 'Pending'
       FOR UPDATE`,
      [leaveId, user_id]
    );

    if (leaveRequests.length === 0) {
      console.error("Leave request not found or not eligible for cancellation");
      await connection.rollback();
      return res.status(404).json({
        error: "Leave request not found, already processed, or doesn't belong to you"
      });
    }

    const leaveRequest = leaveRequests[0];
    console.log(`Found leave request with ${leaveRequest.number_of_days} days`);

    // 2. Get associated leave types
    const [leaveTypes] = await connection.query(
      `SELECT leave_type_id 
       FROM leave_application_types 
       WHERE leave_application_id = ?`,
      [leaveId]
    );

    console.log(`Found ${leaveTypes.length} leave types to restore`);

    if (leaveTypes.length === 0) {
      console.error("No leave types associated with this request");
      await connection.rollback();
      return res.status(400).json({ error: "No leave types associated with this request" });
    }

    // 3. Restore balances for each leave type
    for (const { leave_type_id } of leaveTypes) {
      console.log(`Restoring balance for leave type ${leave_type_id}`);
      
      const [updateResult] = await connection.query(
        `UPDATE employee_leave_balances
         SET used_credit = used_credit - ?,
             remaining_credit = remaining_credit + ?
         WHERE user_id = ? AND leave_type_id = ?`,
        [leaveRequest.number_of_days, leaveRequest.number_of_days, user_id, leave_type_id]
      );

      if (updateResult.affectedRows === 0) {
        console.error(`Failed to update balance for leave type ${leave_type_id}`);
        await connection.rollback();
        return res.status(404).json({
          error: `Could not update balance for leave type ${leave_type_id}`
        });
      }
    }

    // 4. Update leave status (keeping updated_at as it should now exist)
    console.log("Updating leave status to Cancelled");
    const [updateStatus] = await connection.query(
      `UPDATE leave_applications
       SET status = 'Cancelled',
           updated_at = NOW()
       WHERE id = ?`,
      [leaveId]
    );

    if (updateStatus.affectedRows === 0) {
      console.error("Failed to update leave status");
      await connection.rollback();
      return res.status(500).json({ error: "Failed to update leave status" });
    }

    await connection.commit();
    console.log("Leave cancellation successful");
    
    res.json({ 
      success: true,
      message: "Leave request cancelled successfully",
      restored_days: leaveRequest.number_of_days
    });

  } catch (error) {
    console.error("Database error:", error);
    if (connection) await connection.rollback();
    
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        sql: error.sql,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  } finally {
    if (connection) {
      console.log("Releasing database connection");
      connection.release();
    }
  }
});

module.exports = router;
