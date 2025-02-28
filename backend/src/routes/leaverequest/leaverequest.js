const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');  // Enable CORS
const app = express();
const router = express.Router();

// MySQL Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leave_db',
  port: '3306',
});

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Route to fetch the pending leave request
router.get('/api/leave/pending', async (req, res) => {
  const query = 'SELECT * FROM leaveRequests WHERE status = "Pending" LIMIT 1'; // Ensure table name is correct
  
  try {
    const [results] = await db.query(query);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No pending leave requests found' });
    }

    // Return the first pending leave request (you can adjust this if you want multiple requests)
    return res.status(200).json(results[0]);
  } catch (err) {
    console.error('Error fetching pending leave request:', err);
    return res.status(500).json({ message: 'An error occurred while fetching the pending leave request' });
  }
});

// Route to approve or reject a leave request
router.patch('/api/leave/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the status input
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "Approved" or "Rejected".' });
  }

  const query = 'UPDATE leaveRequests SET status = ? WHERE id = ?';  // Ensure table name is correct

  try {
    const [result] = await db.query(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    return res.status(200).json({ message: `Leave request ${status}` });
  } catch (err) {
    console.error('Error updating leave request status:', err);
    return res.status(500).json({ message: 'An error occurred while updating the leave request status' });
  }
});


module.exports = router;
