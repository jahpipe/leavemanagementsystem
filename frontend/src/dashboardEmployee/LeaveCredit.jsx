import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveCredit = () => {
  const [credit, setCredit] = useState(null);
  const userId = 36; // Ensure this user exists in the database

  useEffect(() => {
    const fetchLeaveCredits = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/creditbalance/leave-credits/${userId}`
        );
        setCredit(response.data.credit_balance); // Store only credit_balance
      } catch (error) {
        console.error("Error fetching leave credits:", error);
      }
    };

    fetchLeaveCredits();
  }, [userId]);

  return (
    <div>
      <h2>My Leave Credits</h2>
      {credit !== null ? (
        <p>Leave Balance: {credit} days</p>
      ) : (
        <p>Loading leave credits...</p>
      )}
    </div>
  );
};

export default LeaveCredit;
