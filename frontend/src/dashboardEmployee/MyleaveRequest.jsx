import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const MyLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser?.id) {
      setUserId(loggedInUser.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchLeaveRequests(userId);
    }
  }, [userId]);

  const fetchLeaveRequests = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/leave/leave-requests/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Failed to fetch leave requests", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelLeaveRequest = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/leave/cancel-leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        // Check for specific error messages from backend
        const errorMsg = result.error || 
                        result.details?.message || 
                        "Failed to cancel leave request";
        throw new Error(errorMsg);
      }
  
      alert(result.message);
      fetchLeaveRequests(userId); // Refresh the list
      
    } catch (error) {
      console.error("Cancellation error:", error);
      
      // Show detailed error in development, generic in production
      const errorMsg = process.env.NODE_ENV === 'development' 
        ? `${error.message}\n\n${error.stack}`
        : error.message;
      
      alert(`Error: ${errorMsg}`);
    }
  };

  const filteredRequests = leaveRequests.filter((request) =>
    filter === "All" ? true : request.status === filter
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4 fw-bold text-primary">My Leave Requests</h4>

      <ul className="nav nav-tabs mb-3">
        {["Pending", "Approved", "Rejected", "All"].map((status) => (
          <li className="nav-item" key={status}>
            <button
              className={`nav-link ${filter === status ? "active" : ""}`}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <div className="text-center text-muted">Loading leave requests...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Leave Type</th>
                  <th>Working Days</th>
                  <th>Inclusive Dates</th>
                  <th>Status</th>
                  {filter === "Rejected" && <th>Rejection Reason</th>}
                  {filter === "Pending" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={filter === "Rejected" ? "5" : "4"} className="text-center text-muted">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((request, index) => (
                    <tr key={index}>
                      <td>{request.leave_types ? request.leave_types.join(", ") : ""}</td>
                      <td>{request.number_of_days || ""}</td>
                      <td>{request.leave_dates ? request.leave_dates.join(", ") : ""}</td>
                      <td>
                        <span
                          className={`badge ${
                            request.status === "Approved"
                              ? "bg-success"
                              : request.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      {filter === "Rejected" && (
                        <td className="text-danger">
                          {request.rejection_message ? request.rejection_message : "No reason provided"}
                        </td>
                      )}
                      {filter === "Pending" && (
                        <td>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => cancelLeaveRequest(request.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MyLeaveRequest;