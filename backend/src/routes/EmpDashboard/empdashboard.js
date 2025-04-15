  const express = require("express");
  const router = express.Router();
  const mysql = require("mysql2/promise");

  // Database connection
  const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "leave_db",
    port: 3306
  });

  router.get("/leave-balances/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Get vacation and sick leave balances
      const [balances] = await db.query(`
        SELECT 
          lt.name as leave_type,
          elb.total_credit,
          elb.used_credit,
          elb.remaining_credit
        FROM employee_leave_balances elb
        JOIN leave_types lt ON elb.leave_type_id = lt.id 
        WHERE elb.user_id = ?
      `, [userId]);
  
      // Format response
      const response = {
        balance: {
          total: 0,
          sick: 0,
          vacation: 0,
          emergency: 0
        }
      };
  
      // Calculate totals
      balances.forEach(balance => {
        if (balance.leave_type === 'Vacation Leave') {
          response.balance.vacation = Number(balance.remaining_credit);
        } else if (balance.leave_type === 'Sick Leave') {
          response.balance.sick = Number(balance.remaining_credit);
        }
        // Add other leave types as needed
      });
  
      // Calculate total
      response.balance.total = Number(
        (response.balance.sick + response.balance.vacation).toFixed(2)
      );
  
      res.json(response);
  
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      res.status(500).json({ error: "Failed to fetch leave balances" });
    }
  });
  
  // Get upcoming leaves for a user
  router.get("/upcoming-leaves/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const [leaves] = await db.query(`
        SELECT 
          lt.name as leave_type,
          ld.leave_date,
          la.status
        FROM leave_applications la
        JOIN leave_application_types lat ON la.id = lat.leave_application_id
        JOIN leave_types lt ON lat.leave_type_id = lt.id
        JOIN leave_dates ld ON la.id = ld.leave_application_id
        WHERE la.user_id = ? 
        AND ld.leave_date >= CURDATE()
        ORDER BY ld.leave_date ASC
        LIMIT 5
      `, [userId]);
  
      res.json(leaves);
  
    } catch (error) {
      console.error("Error fetching upcoming leaves:", error);
      res.status(500).json({ error: "Failed to fetch upcoming leaves" });
    }
  });

  module.exports = router;