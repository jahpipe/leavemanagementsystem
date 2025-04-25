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
    GROUP_CONCAT(DISTINCT DATE_FORMAT(ld.leave_date, '%Y-%m-%d')) AS leave_dates,
    -- Add subqueries for leave balances
    (
      SELECT JSON_OBJECT(
        'total_credit', elb.total_credit,
        'used_credit', elb.used_credit,
        'remaining_credit', elb.remaining_credit
      )
      FROM employee_leave_balances elb
      JOIN leave_types lt2 ON elb.leave_type_id = lt2.id
      WHERE elb.user_id = la.user_id AND lt2.name = 'Vacation Leave'
    ) as vacation_leave_balance,
    (
      SELECT JSON_OBJECT(
        'total_credit', elb.total_credit,
        'used_credit', elb.used_credit,
        'remaining_credit', elb.remaining_credit
      )
      FROM employee_leave_balances elb
      JOIN leave_types lt2 ON elb.leave_type_id = lt2.id
      WHERE elb.user_id = la.user_id AND lt2.name = 'Sick Leave'
    ) as sick_leave_balance
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

      // In your GET /api/leaveapproval/:status route, update the formattedResults mapping:
      const formattedResults = results.map(row => {
        // Parse leave balances
        let vacationLeave = null;
        let sickLeave = null;
        
        try {
          if (row.vacation_leave_balance) {
            vacationLeave = JSON.parse(row.vacation_leave_balance);
          }
          if (row.sick_leave_balance) {
            sickLeave = JSON.parse(row.sick_leave_balance);
          }
        } catch (error) {
          console.error('Error parsing leave balances:', error);
        }

        return {
          ...row,
          leave_types: row.leave_types ? row.leave_types.split(",") : [],
          leave_dates: row.leave_dates ? row.leave_dates.split(",") : [],
          rejection_message: row.rejection_message || "",
          other_leave_type: row.other_leave_type || null,
          vacationLeave,
          sickLeave
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
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
      const { id } = req.params;
      let { status, rejection_message } = req.body;
      status = status.toLowerCase();

      if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
      }

      // Get the leave application and its types
      const [applications] = await connection.query(
          `SELECT 
              la.id,
              la.user_id, 
              la.number_of_days,
              lat.leave_type_id
           FROM leave_applications la
           JOIN leave_application_types lat ON la.id = lat.leave_application_id
           WHERE la.id = ?`,
          [id]
      );

      if (applications.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ error: "Leave request not found" });
      }

      const application = applications[0];
      const leaveTypeIds = applications.map(app => app.leave_type_id);

      // Check current status
      const [currentStatus] = await connection.query(
          'SELECT status FROM leave_applications WHERE id = ?',
          [id]
      );

      if (currentStatus[0].status !== 'Pending') {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ 
              error: "Can only update pending leave requests" 
          });
      }

      if (status === "approved") {
          // Check balances before approval
          for (const leaveTypeId of leaveTypeIds) {
              const [balance] = await connection.query(
                  `SELECT remaining_credit 
                   FROM employee_leave_balances 
                   WHERE user_id = ? AND leave_type_id = ?`,
                  [application.user_id, leaveTypeId]
              );

              if (!balance.length || balance[0].remaining_credit < application.number_of_days) {
                  await connection.rollback();
                  connection.release();
                  return res.status(400).json({ 
                      error: `Insufficient leave balance for leave type ${leaveTypeId}` 
                  });
              }
          }

          // Deduct balances only when approved
          for (const leaveTypeId of leaveTypeIds) {
              await connection.query(
                  `UPDATE employee_leave_balances 
                   SET used_credit = used_credit + ?, 
                       remaining_credit = remaining_credit - ? 
                   WHERE user_id = ? AND leave_type_id = ?`,
                  [application.number_of_days, application.number_of_days, 
                   application.user_id, leaveTypeId]
              );
          }
      }

      // Update application status
      const [result] = await connection.query(
          `UPDATE leave_applications 
           SET status = ?, 
               rejection_message = ?,
               updated_at = NOW() 
           WHERE id = ?`,
          [status, rejection_message || null, id]
      );

      if (result.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ error: "Leave request not found" });
      }

      await connection.commit();
      connection.release();

      res.json({ 
          success: true,
          message: `Leave request ${status} successfully`,
          updated: result.affectedRows
      });

  } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error updating leave request:", error);
      res.status(500).json({ 
          error: "Internal server error",
          details: error.message 
      });
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
