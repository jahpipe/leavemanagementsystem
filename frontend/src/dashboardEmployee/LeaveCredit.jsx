import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveCredit = () => {
  const [credit, setCredit] = useState(null);
  const userId = 1; // Replace with the logged-in user's ID

  useEffect(() => {
    axios.get(`http://localhost:8000/api/creditbalance/leave-credits/${userId}`)
      .then(response => setCredit(response.data))
      .catch(error => console.error("Error fetching leave credits:", error));
  }, []);

  return (
    <div>
      <h2>My Leave Credits</h2>
      {credit ? (
        <p>Leave Balance: {credit.credit_balance} days</p>
      ) : (
        <p>Loading leave credits...</p>
      )}
    </div>
  );
};

export default LeaveCredit;
