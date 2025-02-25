// routes/viewemploye/viewemploye.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Adjust this path to match your project structure
const app = express();

app.use(express.json()); // To parse JSON request bodies

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, lastName, contact, username, role, password } = req.body;

  let updateQuery = 'UPDATE users SET fullName = ?, lastName = ?, contact = ?, username = ?, role = ?';
  const queryParams = [fullName, lastName, contact, username, role];

  // If password is provided, hash it and add to the update query
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    updateQuery += ', password = ?';
    queryParams.push(hashedPassword);
  }

  updateQuery += ' WHERE id = ?';
  queryParams.push(id);

  try {
    const [result] = await db.execute(updateQuery, queryParams);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
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
  

module.exports = app;  // Export the app if using this in a modular setup
