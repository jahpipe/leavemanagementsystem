const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Create MySQL connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leave_db',
    port: '3306'
});

router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        console.log('🔍 Login attempt:', { username, role });

        // Fetch only necessary fields
        const query = 'SELECT id, fullName, role, password FROM users WHERE username = ? AND role = ?';
        const [results] = await db.query(query, [username, role]);

        if (results.length === 0) {
            console.log('❌ No user found with provided username and role');
            return res.status(401).json({ message: 'Invalid username or role' });
        }

        const user = results[0];

        // Check if the stored password is properly hashed
        if (!user.password.startsWith("$2b$")) {
            console.log('❌ Password format invalid (not bcrypt-hashed)');
            return res.status(400).json({ message: 'Invalid password format' });
        }

        const match = await bcrypt.compare(password, user.password);
        console.log('🔑 Password match:', match);

        if (match) {
            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    role: user.role,
                },
            });
        } else {
            console.log('❌ Invalid password attempt');
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (err) {
        console.error('🔥 Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
