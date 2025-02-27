const express = require("express");
const mysql = require("mysql"); // <-- Add this line
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
  
  module.exports = router;
