const express = require("express");
const mysql = require("mysql");
const router = express.Router();

// MySQL Connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// Submit leave application
router.post("/", (req, res) => {
  const {
    userId,
    leaveTypes,
    leaveDetails,
    workingDays,
    inclusiveDatesStart,
    inclusiveDatesEnd,
    commutation,
    applicantSignature,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = `
    INSERT INTO leave_applications (
      user_id,
      leave_types,
      leave_details,
      working_days,
      inclusive_dates_start,
      inclusive_dates_end,
      commutation,
      applicant_signature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      userId,
      JSON.stringify(leaveTypes),
      leaveDetails,
      workingDays,
      inclusiveDatesStart,
      inclusiveDatesEnd,
      commutation,
      applicantSignature,
    ],
    (err, result) => {
      if (err) {
        console.error("Error submitting leave application:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.status(201).json({ message: "Leave application submitted successfully!" });
    }
  );
});

// Fetch leave requests for a specific user
router.get("/requests/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT * FROM leave_applications WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching leave requests:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    // Return the data in a JSON format
    const leaveRequests = results.map(request => ({
      leaveTypes: JSON.parse(request.leave_types), // parse the JSON string
      leaveDetails: request.leave_details,
      workingDays: request.working_days,
      inclusiveDatesStart: request.inclusive_dates_start,
      inclusiveDatesEnd: request.inclusive_dates_end,
      commutation: request.commutation,
      applicantSignature: request.applicant_signature,
      status: request.status, // Include the status
    }));

    res.status(200).json(leaveRequests);
  });
});


module.exports = router;
