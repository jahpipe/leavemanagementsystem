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



module.exports = router;  // Export router instead of app
