import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCalendarAlt, FaInfoCircle } from "react-icons/fa"; // Importing React Icons

const MyLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser?.id) {
      setUserId(loggedInUser.id);
      fetchLeaveRequests(loggedInUser.id); // Fetch user's leave requests
    }
  }, []);

  const fetchLeaveRequests = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/leave/requests/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data); // Set fetched leave requests in the state
      } else {
        console.error("Failed to fetch leave requests");
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  // Function to format the date in YYYY-MM-DD format
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // You can adjust the locale and format as needed
  };

  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4 fw-bold text-primary">My Leave Requests</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Leave Type</th>
              <th>Leave Details</th>
              <th>Working Days</th>
              <th>Inclusive Dates</th>
              <th>Commutation</th>
              <th>Signature</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">No leave requests found.</td>
              </tr>
            ) : (
              leaveRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.leaveTypes.join(", ")}</td>
                  <td>{request.leaveDetails}</td>
                  <td>{request.workingDays}</td>
                  <td>{formatDate(request.inclusiveDatesStart)} - {formatDate(request.inclusiveDatesEnd)}</td>
                  <td>{request.commutation}</td>
                  <td>{request.applicantSignature}</td>
                  <td>
                    <span className={`badge ${request.status === "Approved" ? "bg-success" : request.status === "Rejected" ? "bg-danger" : "bg-warning"}`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyLeaveRequest;
