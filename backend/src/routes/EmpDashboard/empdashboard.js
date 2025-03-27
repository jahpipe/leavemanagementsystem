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

// Get user dashboard data
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user info
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get leave balances
    const [balances] = await db.query(`
      SELECT lt.name, elb.total_credit, elb.used_credit, elb.remaining_credit 
      FROM employee_leave_balances elb
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.user_id = ?
    `, [userId]);
    
    // Get pending leave requests count
    const [pendingCount] = await db.query(`
      SELECT COUNT(*) as count FROM leave_applications 
      WHERE user_id = ? AND status = 'Pending'
    `, [userId]);
    
    // Get approved leave requests count
    const [approvedCount] = await db.query(`
      SELECT COUNT(*) as count FROM leave_applications 
      WHERE user_id = ? AND status = 'Approved'
    `, [userId]);
    
    // Get upcoming approved leaves (next 30 days)
    const [upcomingLeaves] = await db.query(`
      SELECT la.id, lt.name as type, GROUP_CONCAT(DATE_FORMAT(ld.leave_date, '%b %d, %Y') SEPARATOR ', ') as dates, la.status
      FROM leave_applications la
      JOIN leave_dates ld ON la.id = ld.leave_application_id
      JOIN leave_application_types lat ON la.id = lat.leave_application_id
      JOIN leave_types lt ON lat.leave_type_id = lt.id
      WHERE la.user_id = ? AND la.status = 'Approved' 
        AND ld.leave_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      GROUP BY la.id
      ORDER BY ld.leave_date ASC
      LIMIT 5
    `, [userId]);
    
    // Get recent leave requests
    const [recentLeaves] = await db.query(`
      SELECT la.id, lt.name as type, 
             DATE_FORMAT(MIN(ld.leave_date), '%b %d, %Y') as start_date,
             DATE_FORMAT(MAX(ld.leave_date), '%b %d, %Y') as end_date,
             la.status, la.rejection_message
      FROM leave_applications la
      JOIN leave_dates ld ON la.id = ld.leave_application_id
      JOIN leave_application_types lat ON la.id = lat.leave_application_id
      JOIN leave_types lt ON lat.leave_type_id = lt.id
      WHERE la.user_id = ?
      GROUP BY la.id
      ORDER BY la.created_at DESC
      LIMIT 5
    `, [userId]);
    
    // Format the response
    const response = {
      user: user[0],
      leaveBalance: balances,
      pendingRequests: pendingCount[0].count,
      approvedRequests: approvedCount[0].count,
      upcomingLeaves: upcomingLeaves.map(leave => ({
        type: leave.type,
        date: leave.dates,
        status: leave.status
      })),
      recentLeaves: recentLeaves.map(leave => ({
        type: leave.type,
        date: leave.start_date === leave.end_date ? 
              leave.start_date : 
              `${leave.start_date} - ${leave.end_date}`,
        status: leave.status,
        rejectionMessage: leave.rejection_message
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leave requests
router.get('/leave-requests/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [requests] = await db.query(`
      SELECT la.id, 
             GROUP_CONCAT(DISTINCT lt.name SEPARATOR ', ') as leave_types,
             la.number_of_days,
             la.status,
             la.created_at,
             la.rejection_message,
             GROUP_CONCAT(DATE_FORMAT(ld.leave_date, '%Y-%m-%d') as dates
      FROM leave_applications la
      JOIN leave_dates ld ON la.id = ld.leave_application_id
      JOIN leave_application_types lat ON la.id = lat.leave_application_id
      JOIN leave_types lt ON lat.leave_type_id = lt.id
      WHERE la.user_id = ?
      GROUP BY la.id
      ORDER BY la.created_at DESC
    `, [userId]);
    
    res.json(requests);
    
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply for leave
router.post('/apply-leave', async (req, res) => {
  try {
    const { userId, leaveTypeIds, startDate, endDate, reason, details } = req.body;
    
    // Calculate number of days (excluding weekends)
    const [daysResult] = await db.query(`
      SELECT COUNT(*) as days
      FROM (
        SELECT ADDDATE(?, t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) selected_date
        FROM
          (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t0,
          (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
          (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
          (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
          (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4
        HAVING selected_date BETWEEN ? AND ?
          AND DAYOFWEEK(selected_date) NOT IN (1,7)
      ) as dates
    `, [startDate, startDate, endDate]);
    
    const numberOfDays = daysResult[0].days;
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Insert leave application
    const [result] = await db.query(`
      INSERT INTO leave_applications 
      (user_id, leave_details, number_of_days, status)
      VALUES (?, ?, ?, 'Pending')
    `, [userId, JSON.stringify(details), numberOfDays]);
    
    const applicationId = result.insertId;
    
    // Insert leave types
    for (const typeId of leaveTypeIds) {
      await db.query(`
        INSERT INTO leave_application_types 
        (leave_application_id, leave_type_id)
        VALUES (?, ?)
      `, [applicationId, typeId]);
    }
    
    // Insert leave dates
    const [dates] = await db.query(`
      SELECT ADDDATE(?, t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) selected_date
      FROM
        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t0,
        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4
      HAVING selected_date BETWEEN ? AND ?
        AND DAYOFWEEK(selected_date) NOT IN (1,7)
    `, [startDate, startDate, endDate]);
    
    for (const date of dates) {
      await db.query(`
        INSERT INTO leave_dates 
        (leave_application_id, leave_date)
        VALUES (?, ?)
      `, [applicationId, date.selected_date]);
    }
    
    await db.query('COMMIT');
    
    res.json({ success: true, applicationId });
    
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error applying for leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // In a real app, you'd have a notifications table
    // For now, we'll check for recent leave status changes
    const [notifications] = await db.query(`
      SELECT 
        la.id,
        CONCAT('Your ', GROUP_CONCAT(DISTINCT lt.name SEPARATOR '/'), ' request has been ', la.status) as text,
        TIMESTAMPDIFF(HOUR, la.updated_at, NOW()) as hours_ago,
        la.status = 'Pending' as is_read
      FROM leave_applications la
      JOIN leave_application_types lat ON la.id = lat.leave_application_id
      JOIN leave_types lt ON lat.leave_type_id = lt.id
      WHERE la.user_id = ? 
        AND la.updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND la.status != 'Pending'
      GROUP BY la.id
      ORDER BY la.updated_at DESC
      LIMIT 10
    `, [userId]);
    
    const formatted = notifications.map(notif => ({
      id: notif.id,
      text: notif.text,
      time: notif.hours_ago < 24 ? 
            `${notif.hours_ago} hours ago` : 
            `${Math.floor(notif.hours_ago / 24)} days ago`,
      read: notif.is_read
    }));
    
    res.json(formatted);
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;