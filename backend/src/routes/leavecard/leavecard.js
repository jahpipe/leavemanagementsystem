const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const cors = require("cors");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Add this to your router file (where you have your other routes)
router.get("/leave-card/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
  
      // Get employee basic information
      const [employee] = await db.query(
        "SELECT * FROM users WHERE id = ?", 
        [employeeId]
      );
  
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
  
      // Get leave records for the employee
      const [records] = await db.query(`
        SELECT 
          la.id,
          lt.name AS leave_type,
          la.created_at AS period,
          la.leave_details AS particulars,
          la.number_of_days AS earned,
          la.status,
          la.created_at AS recorded_date
        FROM leave_applications la
        JOIN leave_application_types lat ON la.id = lat.leave_application_id
        JOIN leave_types lt ON lat.leave_type_id = lt.id
        WHERE la.user_id = ?
        ORDER BY la.created_at DESC
      `, [employeeId]);
  
      // Get leave balances
      const [balances] = await db.query(`
        SELECT 
          lt.name AS leave_type,
          elb.total_credit AS earned,
          elb.used_credit AS abs_und_wp,
          elb.remaining_credit AS balance
        FROM employee_leave_balances elb
        JOIN leave_types lt ON elb.leave_type_id = lt.id
        WHERE elb.user_id = ?
      `, [employeeId]);
  
      // Format the response
      const response = {
        name: `${employee.fullName} ${employee.middleName} ${employee.lastName}`,
        assignment: employee.school_assignment,
        first_day_service: employee.effective_date,
        records: records.map(record => ({
          period: new Date(record.period).toLocaleDateString(),
          particulars: `${record.leave_type} (${record.status})`,
          earned: record.earned,
          abs_und_wp: '', // You might need to calculate this
          balance: '', // You might need to calculate this
          recorded_by: `Recorded on ${new Date(record.recorded_date).toLocaleDateString()}`
        })),
        balances: balances
      };
  
      res.json(response);
    } catch (error) {
      console.error("Error fetching leave card:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;