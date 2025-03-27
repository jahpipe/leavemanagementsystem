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


router.get("/dashboard", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();


    const [employeesCount] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'employee'"
    );

    const [leaveStatusCounts] = await connection.query(
      `SELECT 
        CASE 
          WHEN status = '' THEN 'Pending'
          ELSE status 
        END as status,
        COUNT(*) as count 
      FROM leave_applications 
      GROUP BY CASE 
        WHEN status = '' THEN 'Pending'
        ELSE status 
      END`
    );

  
    const statusCounts = leaveStatusCounts.reduce((acc, { status, count }) => {
      acc[status.toLowerCase()] = count;
      return acc;
    }, {});

 
    const [lowBalances] = await connection.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM employee_leave_balances 
       WHERE remaining_credit < 2`
    );

  
    const [leaveTrends] = await connection.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM leave_applications
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month`
    );


    const [leaveTypes] = await connection.query(
      `SELECT 
        lt.name, 
        COUNT(lat.leave_application_id) as count
      FROM leave_types lt
      LEFT JOIN leave_application_types lat ON lt.id = lat.leave_type_id
      GROUP BY lt.name
      ORDER BY count DESC`
    );


    const [recentActivities] = await connection.query(
      `SELECT 
        la.id,
        CASE 
          WHEN la.status = '' THEN 'Pending'
          ELSE la.status 
        END as status,
        la.created_at,
        CONCAT(u.fullName, ' ', u.lastName) as user_name
      FROM leave_applications la
      JOIN users u ON la.user_id = u.id
      ORDER BY la.created_at DESC
      LIMIT 5`
    );

   
    const [lowBalanceEmployees] = await connection.query(
      `SELECT 
        u.fullName,
        u.lastName,
        lt.name as leave_type,
        elb.remaining_credit
      FROM employee_leave_balances elb
      JOIN users u ON elb.user_id = u.id
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.remaining_credit < 2
      ORDER BY elb.remaining_credit ASC
      LIMIT 5`
    );

 
    res.json({
      stats: {
        totalEmployees: employeesCount[0].count,
        pendingRequests: statusCounts.pending || 0,
        approvedRequests: statusCounts.approved || 0,
        rejectedRequests: statusCounts.rejected || 0,
        lowBalanceAlerts: lowBalances[0].count
      },
      leaveTrends: leaveTrends.map(item => ({
        month: item.month,
        count: item.count
      })),
      leaveTypes: leaveTypes.map(item => ({
        name: item.name,
        count: item.count
      })),
      recentActivities: recentActivities.map(item => ({
        id: item.id,
        action: `Leave request ${item.status.toLowerCase()}`,
        time: item.created_at,
        user: item.user_name
      })),
      upcomingDeadlines: [
        { id: 1, date: 'March 30', event: 'Payroll submission deadline' },
        { id: 2, date: 'April 5', event: 'Quarterly reports due' }
      ],
      lowBalanceDetails: lowBalanceEmployees.map(emp => ({
        name: `${emp.fullName} ${emp.lastName}`,
        leaveType: emp.leave_type,
        remaining: emp.remaining_credit
      }))
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});


router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        id, 
        fullName, 
        lastName, 
        username, 
        role, 
        position,
        school_assignment,
        status_of_employment,
        date_of_birth,
        permanent_address
      FROM users
      ORDER BY fullName, lastName`
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/leave-applications", async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT 
        la.id,
        CASE 
          WHEN la.status = '' THEN 'Pending'
          ELSE la.status 
        END as status,
        la.created_at,
        la.number_of_days,
        CONCAT(u.fullName, ' ', u.lastName) as employee_name,
        u.position,
        u.school_assignment,
        GROUP_CONCAT(DISTINCT lt.name SEPARATOR ', ') as leave_types,
        GROUP_CONCAT(DISTINCT DATE_FORMAT(ld.leave_date, '%M %d, %Y') SEPARATOR ', ') as leave_dates,
        la.leave_details,
        la.rejection_message
      FROM leave_applications la
      JOIN users u ON la.user_id = u.id
      LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
      LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
      LEFT JOIN leave_dates ld ON la.id = ld.leave_application_id
      GROUP BY la.id
      ORDER BY la.created_at DESC`
    );
    res.json(applications);
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/leave-balances", async (req, res) => {
  try {
    const [balances] = await db.query(
      `SELECT 
        elb.id,
        CONCAT(u.fullName, ' ', u.lastName) as employee_name,
        lt.name as leave_type,
        elb.total_credit,
        elb.used_credit,
        elb.remaining_credit,
        u.school_assignment
      FROM employee_leave_balances elb
      JOIN users u ON elb.user_id = u.id
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      ORDER BY employee_name, leave_type`
    );
    res.json(balances);
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/leave-types", async (req, res) => {
  try {
    const [types] = await db.query(
      `SELECT id, name FROM leave_types ORDER BY name`
    );
    res.json(types);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;