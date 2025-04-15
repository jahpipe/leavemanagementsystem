const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Constants
const MAX_LEAVE_CREDITS = 100;
const MONTHLY_CREDIT = 1.25;
const CREDIT_TO_HOURS_RATIO = 8.00;

// Helper functions
const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const parseDecimal = (value) => parseFloat(parseFloat(value).toFixed(2));

// ==================== LEAVE BALANCE ENDPOINTS ====================

// Get all leave balances
router.get("/leave-balance/all", async (req, res) => {
  try {
    const query = `
      SELECT 
        elb.*, 
        u.fullName, 
        lt.name AS leaveTypeName,
        ROUND(elb.total_credit, 2) AS total_credit,
        ROUND(elb.remaining_credit, 2) AS remaining_credit
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

// Get leave balances for a specific user
router.get("/leave-balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        elb.*, 
        lt.name AS leaveTypeName,
        ROUND(elb.total_credit, 2) AS total_credit,
        ROUND(elb.remaining_credit, 2) AS remaining_credit
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

// Add leave credit
// Add leave credit
router.put("/leave-balance/add-credit", async (req, res) => {
  let connection;
  try {
    const { user_id, leave_type_id, creditsToAdd, notes } = req.body;
    
    if (!user_id || !leave_type_id || creditsToAdd === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const creditsToAddFloat = parseDecimal(creditsToAdd);
    if (isNaN(creditsToAddFloat)) {
      return res.status(400).json({ error: "Invalid credit amount" });
    }

    connection = await db.getConnection();
    await connection.query("START TRANSACTION");

    // Check current balance
    const [balanceResults] = await connection.query(
      `SELECT 
        ROUND(total_credit, 2) AS total_credit,
        ROUND(remaining_credit, 2) AS remaining_credit
       FROM employee_leave_balances 
       WHERE user_id = ? AND leave_type_id = ? FOR UPDATE`,
      [user_id, leave_type_id]
    );

    // Calculate new total
    const currentTotal = balanceResults.length > 0 
      ? parseDecimal(balanceResults[0].total_credit)
      : 0;
    const newTotal = parseDecimal(currentTotal + creditsToAddFloat);

    if (newTotal > MAX_LEAVE_CREDITS) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ 
        error: `Cannot exceed maximum leave credits of ${MAX_LEAVE_CREDITS}`,
        code: "MAX_CREDITS_EXCEEDED",
        currentBalance: currentTotal,
        attemptedAddition: creditsToAddFloat
      });
    }

    // Update the INSERT query in the add-credit route
if (balanceResults.length > 0) {
  // Update existing record
  await connection.query(
    `UPDATE employee_leave_balances
     SET 
       total_credit = ROUND(?, 2),
       remaining_credit = ROUND(remaining_credit + ?, 2),
       last_accrual_date = NOW()
     WHERE user_id = ? AND leave_type_id = ?`,
    [newTotal, creditsToAddFloat, user_id, leave_type_id]
  );
} else {
  // Insert new record without recorded_by
  await connection.query(
    `INSERT INTO employee_leave_balances 
     (user_id, leave_type_id, accrual_start_date, monthly_credit, 
      credit_to_hours_ratio, total_credit, used_credit, used_hours, 
      remaining_credit, recorded_date)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, NOW())`,
    [
      user_id, 
      leave_type_id, 
      getCurrentDate(), 
      MONTHLY_CREDIT,
      CREDIT_TO_HOURS_RATIO,
      newTotal,
      newTotal
    ]
  );
}

    // Record in history
    await connection.query(
      `INSERT INTO leave_accrual_history 
       (user_id, leave_type_id, accrual_date, credit_amount, recorded_at, notes)
       VALUES (?, ?, NOW(), ROUND(?, 2), NOW(), ?)`,
      [user_id, leave_type_id, creditsToAddFloat, notes || null]
    );

    await connection.query("COMMIT");
    res.json({ 
      success: true,
      message: "Leave credit added successfully",
      data: {
        user_id,
        leave_type_id,
        previous_balance: currentTotal,
        credit_added: creditsToAddFloat,
        new_balance: newTotal
      }
    });
  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Error adding leave credit:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Use leave credit
router.put("/leave-balance/use-credit", async (req, res) => {
  let connection;
  try {
    const { balance_id, used_credit } = req.body;
    
    if (!balance_id || used_credit === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const usedCreditFloat = parseDecimal(used_credit);
    if (isNaN(usedCreditFloat)) {
      return res.status(400).json({ error: "Invalid credit amount" });
    }

    connection = await db.getConnection();
    await connection.query("START TRANSACTION");

    // Get current balance with proper locking
    const [currentBalance] = await connection.query(
      `SELECT 
        ROUND(total_credit, 2) AS total_credit,
        ROUND(used_credit, 2) AS used_credit,
        ROUND(remaining_credit, 2) AS remaining_credit,
        credit_to_hours_ratio
       FROM employee_leave_balances 
       WHERE id = ? FOR UPDATE`,
      [balance_id]
    );

    if (currentBalance.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Leave balance not found" });
    }

    // Validate sufficient balance
    if (usedCreditFloat > currentBalance[0].remaining_credit) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ 
        error: "Insufficient remaining credits",
        remaining_credits: currentBalance[0].remaining_credit,
        attempted_use: usedCreditFloat
      });
    }

    // Calculate new values
    const newUsedCredit = parseDecimal(currentBalance[0].used_credit + usedCreditFloat);
    const newRemaining = parseDecimal(currentBalance[0].remaining_credit - usedCreditFloat);
    const newUsedHours = parseDecimal(newUsedCredit / currentBalance[0].credit_to_hours_ratio);

    // Update balance
    const [updateResult] = await connection.query(
      `UPDATE employee_leave_balances
       SET 
         used_credit = ROUND(?, 2),
         used_hours = ROUND(?, 2),
         remaining_credit = ROUND(?, 2),
         last_application_date = NOW()
       WHERE id = ?`,
      [newUsedCredit, newUsedHours, newRemaining, balance_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(500).json({ error: "Failed to update leave balance" });
    }

    await connection.query("COMMIT");
    res.json({ 
      success: true,
      message: "Leave credits deducted successfully",
      data: {
        balance_id,
        credits_used: usedCreditFloat,
        hours_used: newUsedHours,
        new_remaining: newRemaining,
        new_used_total: newUsedCredit
      }
    });
  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Error using leave credits:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message
    });
  } finally {
    if (connection) connection.release();
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

// Monthly accrual endpoint
router.post("/leave-balance/monthly-accrual", async (req, res) => {
  let connection;
  try {
    const { user_id, leave_type_id } = req.body;
    
    if (!user_id || !leave_type_id) {
      return res.status(400).json({ error: "Missing user_id or leave_type_id" });
    }

    connection = await db.getConnection();
    await connection.query("START TRANSACTION");

    // Check if accrual already done this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [existingAccrual] = await connection.query(
      `SELECT * FROM leave_accrual_history 
       WHERE user_id = ? AND leave_type_id = ?
       AND DATE_FORMAT(accrual_date, '%Y-%m') = ?`,
      [user_id, leave_type_id, currentMonth]
    );

    if (existingAccrual.length > 0) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ 
        error: "Monthly accrual already processed for this user/leave type",
        code: "DUPLICATE_ACCRUAL"
      });
    }

    // Check current balance
    const [currentBalance] = await connection.query(
      `SELECT 
        ROUND(total_credit, 2) AS total_credit,
        ROUND(remaining_credit, 2) AS remaining_credit
       FROM employee_leave_balances 
       WHERE user_id = ? AND leave_type_id = ? FOR UPDATE`,
      [user_id, leave_type_id]
    );

    if (currentBalance.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ 
        error: "Leave balance not found",
        code: "BALANCE_NOT_FOUND" 
      });
    }

    // Calculate new total
    const currentTotal = parseDecimal(currentBalance[0].total_credit);
    const newTotal = parseDecimal(currentTotal + MONTHLY_CREDIT);
    const newRemaining = parseDecimal(currentBalance[0].remaining_credit + MONTHLY_CREDIT);

    if (newTotal > MAX_LEAVE_CREDITS) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ 
        error: `Cannot exceed maximum leave credits of ${MAX_LEAVE_CREDITS}`,
        code: "MAX_CREDITS_EXCEEDED",
        currentBalance: currentTotal,
        attemptedAddition: MONTHLY_CREDIT
      });
    }

    // Update main balance
    const [updateResult] = await connection.query(
      `UPDATE employee_leave_balances
       SET 
         total_credit = ROUND(?, 2),
         remaining_credit = ROUND(?, 2),
         last_accrual_date = NOW()
       WHERE user_id = ? AND leave_type_id = ?`,
      [newTotal, newRemaining, user_id, leave_type_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(500).json({ 
        error: "Failed to update leave balance",
        code: "UPDATE_FAILED"
      });
    }

    // Record in history
    await connection.query(
      `INSERT INTO leave_accrual_history 
       (user_id, leave_type_id, accrual_date, credit_amount, recorded_at)
       VALUES (?, ?, NOW(), ROUND(?, 2), NOW())`,
      [user_id, leave_type_id, MONTHLY_CREDIT]
    );

    await connection.query("COMMIT");
    
    res.json({ 
      success: true,
      message: `${MONTHLY_CREDIT} credits added successfully for this month`,
      data: {
        user_id,
        leave_type_id,
        previous_balance: currentTotal,
        credit_added: MONTHLY_CREDIT,
        new_balance: newTotal,
        accrual_date: new Date().toISOString()
      }
    });
  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Error processing monthly accrual:", error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: "Database table not found",
        details: "Required tables might not exist"
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      code: "SERVER_ERROR",
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ==================== ACCRUAL HISTORY ENDPOINTS ====================

// Get accrual history for a user and leave type
router.get("/leave-balance/accrual-history/:userId/:leaveTypeId", async (req, res) => {
  try {
    const { userId, leaveTypeId } = req.params;
    
    const [results] = await db.query(
      `SELECT 
        lah.id,
        lah.accrual_date,
        ROUND(lah.credit_amount, 2) AS credit_amount,
        lah.recorded_at,
        lah.notes,
        lah.is_manual,
        u.fullName,
        lt.name AS leaveTypeName,
        DATE_FORMAT(lah.accrual_date, '%Y-%m') AS accrual_month
       FROM leave_accrual_history lah
       JOIN users u ON lah.user_id = u.id
       JOIN leave_types lt ON lah.leave_type_id = lt.id
       WHERE lah.user_id = ? AND lah.leave_type_id = ?
       ORDER BY lah.accrual_date DESC`,
      [userId, leaveTypeId]
    );

    // Group by month and calculate totals properly
    const monthlySummary = results.reduce((acc, record) => {
      const month = record.accrual_month;
      if (!acc[month]) {
        acc[month] = {
          month: month,
          count: 0,
          total: 0,
          records: []
        };
      }
      acc[month].count++;
      acc[month].total += parseDecimal(record.credit_amount);
      acc[month].records.push(record);
      return acc;
    }, {});

    // Format the response with proper decimal places
    const formattedSummary = Object.values(monthlySummary).map(month => ({
      ...month,
      total: parseDecimal(month.total)
    }));

    res.json({
      details: results.map(r => ({
        ...r,
        credit_amount: `+${parseDecimal(r.credit_amount)}`,
        recorded_at: new Date(r.recorded_at).toLocaleString()
      })),
      monthlySummary: formattedSummary
    });
  } catch (error) {
    console.error("Error fetching accrual history:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// ==================== EMPLOYEE AND LEAVE TYPE ENDPOINTS ====================

// Get all employees
router.get("/employees", async (req, res) => {
  try {
    const [results] = await db.execute("SELECT id, fullName FROM users");
    res.json(results);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all leave types
router.get("/leave-types", async (req, res) => {
  try {
    const [results] = await db.execute("SELECT id, name FROM leave_types");
    res.json(results);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== DATA SYNC ENDPOINT ====================

// Sync all leave balances with their history (one-time fix)
router.post("/leave-balance/sync-all", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query("START TRANSACTION");

    // Get all balances that need syncing
    const [imbalancedRecords] = await connection.query(
      `SELECT elb.id, elb.user_id, elb.leave_type_id, 
       ROUND(elb.total_credit, 2) AS current_total,
       ROUND((
         SELECT SUM(ROUND(credit_amount, 2))
         FROM leave_accrual_history 
         WHERE user_id = elb.user_id AND leave_type_id = elb.leave_type_id
       ), 2) AS correct_total
       FROM employee_leave_balances elb
       WHERE ROUND(elb.total_credit, 2) != ROUND((
         SELECT SUM(ROUND(credit_amount, 2))
         FROM leave_accrual_history 
         WHERE user_id = elb.user_id AND leave_type_id = elb.leave_type_id
       ), 2)`
    );

    // Update each imbalanced record
    for (const record of imbalancedRecords) {
      await connection.query(
        `UPDATE employee_leave_balances
         SET 
           total_credit = ROUND(?, 2),
           remaining_credit = ROUND(? - used_credit, 2)
         WHERE id = ?`,
        [record.correct_total, record.correct_total, record.id]
      );
    }

    await connection.query("COMMIT");
    res.json({ 
      success: true,
      message: `${imbalancedRecords.length} leave balances synchronized`,
      details: imbalancedRecords
    });
  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Error syncing leave balances:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});


// Manual credit adjustment (for random amounts)
router.put("/leave-balance/manual-adjust", async (req, res) => {
  let connection;
  try {
    const { user_id, leave_type_id, credits, notes } = req.body;
    
    if (!user_id || !leave_type_id || credits === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const creditsFloat = parseDecimal(credits);
    if (isNaN(creditsFloat)) {
      return res.status(400).json({ error: "Invalid credit amount" });
    }

    connection = await db.getConnection();
    await connection.query("START TRANSACTION");

    // Check current balance
    const [currentBalance] = await connection.query(
      `SELECT 
        ROUND(total_credit, 2) AS total_credit,
        ROUND(remaining_credit, 2) AS remaining_credit
       FROM employee_leave_balances 
       WHERE user_id = ? AND leave_type_id = ? FOR UPDATE`,
      [user_id, leave_type_id]
    );

    // Calculate new total (allowing negative adjustments)
    const newTotal = currentBalance.length > 0 
      ? parseDecimal(currentBalance[0].total_credit + creditsFloat)
      : creditsFloat > 0 ? creditsFloat : 0;

    if (newTotal > MAX_LEAVE_CREDITS) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ 
        error: `Cannot exceed maximum leave credits of ${MAX_LEAVE_CREDITS}`,
        max: MAX_LEAVE_CREDITS,
        attempted: newTotal
      });
    }

    if (currentBalance.length > 0) {
      // Update existing record
      await connection.query(
        `UPDATE employee_leave_balances
         SET 
           total_credit = ROUND(?, 2),
           remaining_credit = ROUND(remaining_credit + ?, 2),
           last_manual_adjust_date = NOW()
         WHERE user_id = ? AND leave_type_id = ?`,
        [newTotal, creditsFloat, user_id, leave_type_id]
      );
    } else if (creditsFloat > 0) {
      // Only create new record if adding credits
      await connection.query(
        `INSERT INTO employee_leave_balances (...) 
         VALUES (?, ?, NOW(), 0, 8.0, ?, 0, 0, ?, NOW())`,
        [user_id, leave_type_id, newTotal, newTotal]
      );
    }

    // Record in history with adjustment type
    await connection.query(
      `INSERT INTO leave_accrual_history 
       (user_id, leave_type_id, accrual_date, credit_amount, notes, is_manual, recorded_at)
       VALUES (?, ?, NOW(), ROUND(?, 2), ?, 1, NOW())`,
      [user_id, leave_type_id, creditsFloat, notes || null]
    );

    await connection.query("COMMIT");
    res.json({ 
      success: true,
      message: creditsFloat >= 0 
        ? `Added ${creditsFloat} credits successfully` 
        : `Deducted ${Math.abs(creditsFloat)} credits successfully`,
      newBalance: newTotal
    });
  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Manual adjustment error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;