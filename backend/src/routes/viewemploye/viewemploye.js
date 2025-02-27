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
  port: '3306'
});

// GET all users
router.get('/', async (req, res) => {
  try {
    // Fetch all users from the database
    const [rows] = await db.execute('SELECT id, fullName, lastName, contact, username, role FROM users');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    
    // Return the users in the response
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT (update) a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, lastName, contact, username, role, password } = req.body;
    let query;
    let params;

    // If a new password is provided, hash it and include in update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET fullName = ?, lastName = ?, contact = ?, username = ?, role = ?, password = ? WHERE id = ?`;
      params = [fullName, lastName, contact, username, role, hashedPassword, id];
    } else {
      // If no new password, update other fields only
      query = `UPDATE users SET fullName = ?, lastName = ?, contact = ?, username = ?, role = ? WHERE id = ?`;
      params = [fullName, lastName, contact, username, role, id];
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

// DELETE a user
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
