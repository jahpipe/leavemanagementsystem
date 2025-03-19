import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const Admin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userCounts, setUserCounts] = useState({ admin: 0, employee: 0 });
  const pageSize = 5; 

  const parseDetails = (details) => {
    if (!details) return "";
    try {
      const parsed = typeof details === "string" ? JSON.parse(details) : details;
      const filtered = Object.entries(parsed)
        .filter(([key, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => `${key}: ${value}`);
      return filtered.join(", ");
    } catch (error) {
      return details.replace(/[{}]/g, "");
    }
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/leaveapproval/pending?page=${page}&limit=${pageSize}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch leave requests");
        }
        const data = await response.json();
        setLeaveRequests(data);
        setHasMore(data.length === pageSize);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [page]);

  const handleAction = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/leaveapproval/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.toLowerCase() }),
      });

      if (response.ok) {
        setLeaveRequests(leaveRequests.filter((request) => request.id !== id));
        alert(`Leave request ${status.toLowerCase()} successfully!`);
      } else {
        alert("Failed to update leave request.");
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      alert("An error occurred while updating the request.");
    }
  };

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/count");
        if (!response.ok) {
          throw new Error("Failed to fetch user counts");
        }
        const data = await response.json();
        setUserCounts(data);
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };
  
    fetchUserCounts();
  }, []);
  
  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h4 className="text-center mb-4 fw-bold">Pending Leave Requests</h4>
        {/* Table or Message */}
        {leaveRequests.length === 0 ? (
          <div className="alert alert-info text-center">No pending leave requests.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Employee Name</th>
                  <th>Leave Types</th>
                  <th>Details</th>
                  <th>Leave Dates</th>
               
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName} {request.lastName}</td>
                    <td>{request.leave_types.join(", ")}</td>
                    <td>{parseDetails(request.leave_details)}</td>
                    <td>{request.leave_dates.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Admin;
