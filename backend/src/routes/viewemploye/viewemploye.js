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

// GET all users
// Updated GET endpoint in your backend (users.js)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, fullName, middleName, lastName, contact, username, role, position, salary, 
       place_of_birth, date_of_birth, permanent_address, special_order_no, 
       status_of_employment, effective_date, nature_of_appointment, school_assignment,
       COALESCE(employment_history, '[]') as employment_history FROM users`
    );
    
    // Parse the employment_history for each user
    const usersWithHistory = rows.map(user => ({
      ...user,
      employment_history: JSON.parse(user.employment_history)
    }));
    
    res.json(usersWithHistory);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Employee Route
router.post('/', async (req, res) => {
  const { fullName, middleName, lastName, contact, username, password, role, position, salary, 
    place_of_birth, date_of_birth, permanent_address, special_order_no, 
    status_of_employment, effective_date, nature_of_appointment, school_assignment } = req.body;

  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Only "admin" or "employee" are allowed.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (fullName, middleName, lastName, contact, username, password, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      fullName, middleName, lastName, contact, username, hashedPassword, role, position, salary, 
      place_of_birth, date_of_birth, permanent_address, special_order_no, 
      status_of_employment, effective_date, nature_of_appointment, school_assignment
    ]);

    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user by ID (with employment history tracking)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      track_employment_changes,
      current_employment_data,
      ...updateFields
    } = req.body;

    // Always get current employment history first
    const [currentUser] = await db.execute('SELECT employment_history FROM users WHERE id = ?', [id]);
    let employmentHistory = currentUser[0].employment_history 
      ? JSON.parse(currentUser[0].employment_history)
      : [];

    // Only add new history record if tracking employment changes
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

    const query = `
      UPDATE users 
      SET fullName=?, middleName=?, lastName=?, contact=?, username=?, role=?, position=?, salary=?,
      place_of_birth=?, date_of_birth=?, permanent_address=?, special_order_no=?, 
      status_of_employment=?, effective_date=?, nature_of_appointment=?, school_assignment=?,
      employment_history=?
      WHERE id=?
    `;
    
    const params = [
      updateFields.fullName, updateFields.middleName, updateFields.lastName,
      updateFields.contact, updateFields.username, updateFields.role,
      updateFields.position, updateFields.salary,
      updateFields.place_of_birth, updateFields.date_of_birth,
      updateFields.permanent_address, updateFields.special_order_no,
      updateFields.status_of_employment, updateFields.effective_date,
      updateFields.nature_of_appointment, updateFields.school_assignment,
      JSON.stringify(employmentHistory), // This now preserves existing history
      id
    ];

    await db.execute(query, params);
    
    // Return the updated user with parsed employment history
    const [updatedUser] = await db.execute(
      'SELECT *, COALESCE(employment_history, "[]") as employment_history FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      ...updatedUser[0],
      employment_history: JSON.parse(updatedUser[0].employment_history)
    });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET active and offline users
router.get('/status', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, fullName, middleName, lastName, contact, username, role, position, salary, 
       place_of_birth, date_of_birth, permanent_address, special_order_no, 
       status_of_employment, effective_date, nature_of_appointment, school_assignment, status 
       FROM users WHERE status IN ('active', 'offline')`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, fullName, middleName, lastName, contact, username, role, position, salary, 
       place_of_birth, date_of_birth, permanent_address, special_order_no, 
       status_of_employment, effective_date, nature_of_appointment, school_assignment,
       employment_history FROM users`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;