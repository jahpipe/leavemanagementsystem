const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');  
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

// Route to fetch all leave requests for a user
router.get('/api/leave/requests/:userId', async (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM leaveRequests WHERE userId = ?';

  try {
    const [results] = await db.query(query, [userId]);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    return res.status(500).json({ message: 'An error occurred while fetching leave requests' });
  }
});

// Route to fetch pending leave requests
router.get('/api/leave/pending', async (req, res) => {
  const query = 'SELECT * FROM leaveRequests WHERE status = "Pending"';

  try {
    const [results] = await db.query(query);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching pending leave requests:', err);
    return res.status(500).json({ message: 'An error occurred while fetching pending leave requests' });
  }
});

// Route to fetch approved leave requests
router.get('/api/leave/approved', async (req, res) => {
  const query = 'SELECT * FROM leaveRequests WHERE status = "Approved"';

  try {
    const [results] = await db.query(query);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching approved leave requests:', err);
    return res.status(500).json({ message: 'An error occurred while fetching approved leave requests' });
  }
});

// Route to fetch rejected leave requests
router.get('/api/leave/rejected', async (req, res) => {
  const query = 'SELECT * FROM leaveRequests WHERE status = "Rejected"';

  try {
    const [results] = await db.query(query);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching rejected leave requests:', err);
    return res.status(500).json({ message: 'An error occurred while fetching rejected leave requests' });
  }
});

// Route to approve or reject a leave request
router.patch('/api/leave/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "Approved" or "Rejected".' });
  }

  const query = 'UPDATE leaveRequests SET status = ? WHERE id = ?';

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
