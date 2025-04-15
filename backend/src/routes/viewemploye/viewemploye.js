const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leave_db',
  port: '3306',
});

// Improved date formatting with validation
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch (err) {
    console.error('Error formatting date:', dateString, err);
    return null;
  }
};

// GET all users with their leave balances
router.get('/', async (req, res) => {
  try {
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
    `);

    const hasStatusColumn = columns.length > 0;

    const query = `
      SELECT 
        u.id, u.fullName, u.middleName, u.lastName, u.contact, u.username, u.role, 
        u.position, u.salary, u.place_of_birth, u.date_of_birth, u.permanent_address, 
        u.special_order_no, u.status_of_employment, u.effective_date, 
        u.nature_of_appointment, u.school_assignment, u.employment_history,
        ${hasStatusColumn ? 'u.status' : "'offline' as status"},
        elb.id as balance_id, elb.leave_type_id, elb.total_credit, elb.used_credit, 
        elb.remaining_credit, elb.period, elb.recorded_date, elb.recorded_by,
        lt.name as leave_type_name, lt.name as leaveType
      FROM users u
      LEFT JOIN employee_leave_balances elb ON u.id = elb.user_id
      LEFT JOIN leave_types lt ON elb.leave_type_id = lt.id
      ORDER BY u.id, elb.period DESC
    `;

    const [users] = await db.execute(query);

    const usersWithLeaveBalances = users.reduce((acc, row) => {
      const user = acc.find(u => u.id === row.id);
      
      if (!user) {
        const newUser = {
          id: row.id,
          fullName: row.fullName,
          middleName: row.middleName,
          lastName: row.lastName,
          contact: row.contact,
          username: row.username,
          role: row.role,
          position: row.position,
          salary: row.salary,
          place_of_birth: row.place_of_birth,
          date_of_birth: formatDate(row.date_of_birth),
          permanent_address: row.permanent_address,
          special_order_no: row.special_order_no,
          status_of_employment: row.status_of_employment,
          effective_date: formatDate(row.effective_date),
          nature_of_appointment: row.nature_of_appointment,
          school_assignment: row.school_assignment,
          status: row.status,
          employment_history: row.employment_history ? JSON.parse(row.employment_history) : [],
          leaveBalances: []
        };
        
        if (row.balance_id) {
          newUser.leaveBalances.push({
            id: row.balance_id,
            leave_type_id: row.leave_type_id,
            leave_type: row.leave_type_name,
            total_credit: row.total_credit,
            used_credit: row.used_credit,
            remaining_credit: row.remaining_credit,
            period: formatDate(row.period),
            recorded_date: formatDate(row.recorded_date),
            recorded_by: row.recorded_by
          });
        }
        
        acc.push(newUser);
      } else if (row.balance_id) {
        user.leaveBalances.push({
          id: row.balance_id,
          leave_type_id: row.leave_type_id,
          leave_type: row.leave_type_name,
          total_credit: row.total_credit,
          used_credit: row.used_credit,
          remaining_credit: row.remaining_credit,
          period: formatDate(row.period),
          recorded_date: formatDate(row.recorded_date),
          recorded_by: row.recorded_by
        });
      }
      
      return acc;
    }, []);

    res.json(usersWithLeaveBalances);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get leave card for a specific user
// Get leave card for a specific user with accrual history
router.get('/:id/leave-card', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user information including teaching status
    const [userInfo] = await db.execute(`
      SELECT 
        u.id, 
        CONCAT(u.fullName, ' ', u.lastName) as fullName,
        u.school_assignment,
        u.effective_date,
        u.position,
        u.nature_of_appointment,
        CASE 
          WHEN LOWER(u.position) LIKE '%teacher%' 
            OR LOWER(u.position) LIKE '%faculty%'
            OR LOWER(u.nature_of_appointment) LIKE '%teaching%'
          THEN true 
          ELSE false 
        END as isTeaching
      FROM users u 
      WHERE u.id = ?
    `, [id]);

    if (!userInfo.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all leave transactions (accruals + deductions)
    const [transactions] = await db.execute(`
      -- Get accruals from leave_accrual_history
      SELECT 
        lah.id,
        lah.accrual_date as date,
        lah.credit_amount,
        lah.recorded_at,
        lah.notes,
        lt.name as leave_type,
        COALESCE(u.fullName, 'System') as recorded_by,
        'ACCRUAL' as transaction_type
      FROM leave_accrual_history lah
      JOIN leave_types lt ON lah.leave_type_id = lt.id
      LEFT JOIN users u ON lah.recorded_by = u.id
      WHERE lah.user_id = ?
      
      UNION ALL
      
      -- Get deductions from leave_applications
      SELECT 
        la.id,
        la.created_at as date,
        -1 * la.number_of_days as credit_amount,
        la.created_at as recorded_at,
        CONCAT('Leave application: ', la.status) as notes,
        lt.name as leave_type,
        COALESCE(u.fullName, 'System') as recorded_by,
        'DEDUCTION' as transaction_type
      FROM leave_applications la
      JOIN leave_application_types lat ON la.id = lat.leave_application_id
      JOIN leave_types lt ON lat.leave_type_id = lt.id
      LEFT JOIN users u ON la.user_id = u.id
      WHERE la.user_id = ? AND la.status = 'approved'
      
      ORDER BY date DESC
    `, [id, id]);

    // Get current balances
    const [balances] = await db.execute(`
      SELECT 
        lt.name as leave_type,
        elb.total_credit,
        elb.used_credit,
        elb.remaining_credit
      FROM employee_leave_balances elb
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.user_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        userInfo: {
          ...userInfo[0],
          firstDayOfService: userInfo[0].effective_date,
          isTeaching: userInfo[0].isTeaching
        },
        transactions: transactions.map(t => ({
          ...t,
          date: formatDate(t.date),
          recorded_at: formatDate(t.recorded_at),
          description: t.notes || t.transaction_type,
          creditChange: t.credit_amount,
          leaveType: t.leave_type
        })),
        balances
      }
    });
  } catch (err) {
    console.error('Error fetching leave card:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leave card',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Register new employee with default leave balances
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      fullName, middleName, lastName, contact, username, password, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment 
    } = req.body;

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Only "admin" or "employee" are allowed.' 
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Determine if teaching or non-teaching staff
    const isTeaching = position.toLowerCase().includes('teacher') || 
                      position.toLowerCase().includes('faculty') ||
                      nature_of_appointment.toLowerCase().includes('teaching');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user
    const [result] = await connection.query(`
      INSERT INTO users 
      (fullName, middleName, lastName, contact, username, password, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'offline')
    `, [
      fullName, middleName, lastName, contact, username, hashedPassword, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment
    ]);

    const userId = result.insertId;

    // Create default leave balances for the new employee
    if (role === 'employee') {
      // Get only Vacation and Sick leave types
      const [leaveTypes] = await connection.query(
        `SELECT id, name FROM leave_types 
         WHERE name IN ('Vacation Leave', 'Sick Leave')`
      );
      
      for (const lt of leaveTypes) {
        let initialCredit = 0; 
        
        // Set initial credits based on leave type and user type
        if (lt.name.toLowerCase() === 'vacation leave') {
          initialCredit = isTeaching ? 15 : 15;
        } else if (lt.name.toLowerCase() === 'sick leave') {
          initialCredit = isTeaching ? 15 : 15;
        }

        await connection.query(`
          INSERT INTO employee_leave_balances 
          (user_id, leave_type_id, total_credit, used_credit, remaining_credit, period, recorded_date)
          VALUES (?, ?, ?, 0, ?, ?, NOW())
        `, [userId, lt.id, initialCredit, initialCredit, effective_date]);

        // For both teaching and non-teaching, add initial accruals using recorded_at
        if (lt.name.toLowerCase() === 'vacation leave') {
          const creditAmount = isTeaching ? 1.25 : 1.00;
          for (let i = 0; i < 5; i++) { // Add 5 sample accruals
            await connection.query(`
              INSERT INTO leave_accrual_history 
              (user_id, leave_type_id, credit_amount, recorded_at, recorded_by)
              VALUES (?, ?, ?, NOW(), 'System')
            `, [userId, lt.id, creditAmount]);
          }
        }
      }
    }

    await connection.commit();
    res.status(201).json({ 
      success: true,
      message: 'Employee registered successfully', 
      data: {
        userId,
        leaveBalancesCreated: role === 'employee',
        isTeaching
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error during registration:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to register employee',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Update user by ID with employment history tracking
router.put('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { 
      track_employment_changes,
      current_employment_data,
      ...updateFields
    } = req.body;

    // Get current employment history
    const [currentUser] = await connection.execute(
      'SELECT employment_history FROM users WHERE id = ?', 
      [id]
    );
    
    if (!currentUser.length) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    let employmentHistory = currentUser[0].employment_history 
      ? JSON.parse(currentUser[0].employment_history)
      : [];

    // Add new history record if tracking employment changes
    if (track_employment_changes && current_employment_data) {
      employmentHistory.push({
        date_changed: new Date().toISOString(),
        effective_date: current_employment_data.effective_date,
        position: current_employment_data.position,
        salary: current_employment_data.salary,
        status_of_employment: current_employment_data.status_of_employment,
        special_order_no: current_employment_data.special_order_no,
        nature_of_appointment: current_employment_data.nature_of_appointment,
        school_assignment: current_employment_data.school_assignment
      });
    }

    // Update user
    await connection.execute(`
      UPDATE users 
      SET fullName=?, middleName=?, lastName=?, contact=?, username=?, role=?, position=?, salary=?,
      place_of_birth=?, date_of_birth=?, permanent_address=?, special_order_no=?, 
      status_of_employment=?, effective_date=?, nature_of_appointment=?, school_assignment=?,
      employment_history=?
      WHERE id=?
    `, [
      updateFields.fullName, updateFields.middleName, updateFields.lastName,
      updateFields.contact, updateFields.username, updateFields.role,
      updateFields.position, updateFields.salary,
      updateFields.place_of_birth, updateFields.date_of_birth,
      updateFields.permanent_address, updateFields.special_order_no,
      updateFields.status_of_employment, updateFields.effective_date,
      updateFields.nature_of_appointment, updateFields.school_assignment,
      JSON.stringify(employmentHistory),
      id
    ]);

    // Get updated user data
    const [updatedUser] = await connection.execute(
      'SELECT *, COALESCE(employment_history, "[]") as employment_history FROM users WHERE id = ?',
      [id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      data: {
        ...updatedUser[0],
        employment_history: JSON.parse(updatedUser[0].employment_history)
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating user:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await connection.commit();
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting user:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Get users by status
router.get('/status', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, fullName, middleName, lastName, contact, username, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment, status 
      FROM users WHERE status IN ('active', 'offline')`
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No users found' 
      });
    }

    // Format dates in the response
    const formattedRows = rows.map(row => ({
      ...row,
      date_of_birth: formatDate(row.date_of_birth),
      effective_date: formatDate(row.effective_date)
    }));

    res.json({
      success: true,
      data: formattedRows
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;