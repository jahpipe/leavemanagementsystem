const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// MySQL Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leave_db',
  port: '3306',
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, fullName, middleName, lastName, contact, username, role, position, salary FROM users'
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

// Register Employee Route
router.post('/', async (req, res) => {
  const { fullName, middleName, lastName, contact, username, password, role, position, salary } = req.body;

  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Only "admin" or "employee" are allowed.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (salary !== undefined && (isNaN(salary) || salary < 0)) {
    return res.status(400).json({ message: 'Salary must be a positive number' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (fullName, middleName, lastName, contact, username, password, role, position, salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      fullName,
      middleName,
      lastName,
      contact,
      username,
      hashedPassword,
      role,
      position,
      salary,
    ]);

    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, middleName, lastName, contact, username, role, position, salary, password } = req.body;

    let query;
    let params;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE users 
        SET fullName = ?, middleName = ?, lastName = ?, contact = ?, username = ?, role = ?, position = ?, salary = ?, password = ? 
        WHERE id = ?
      `;
      params = [fullName, middleName, lastName, contact, username, role, position, salary, hashedPassword, id];
    } else {
      query = `
        UPDATE users 
        SET fullName = ?, middleName = ?, lastName = ?, contact = ?, username = ?, role = ?, position = ?, salary = ? 
        WHERE id = ?
      `;
      params = [fullName, middleName, lastName, contact, username, role, position, salary, id];
    }

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.json({ message: 'User updated successfully' });
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

module.exports = router;