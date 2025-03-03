import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const LeaveRequestApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5; // Show only 5 records per page

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/leaveapproval/${tab}?page=${page}&limit=${pageSize}`);
        if (!response.ok) {
          throw new Error("Failed to fetch leave requests");
        }
        const data = await response.json();
        setLeaveRequests(data);
        setHasMore(data.length === pageSize); // If less than 5 records, no more pages
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [tab, page]);

  const handleAction = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/leaveapproval/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h4 className="text-center mb-4 fw-bold">Leave Request Approval</h4>
        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          {["pending", "approved", "rejected"].map((status) => (
            <li className="nav-item" key={status}>
              <button className={`nav-link ${tab === status ? "active" : ""}`} onClick={() => { setTab(status); setPage(1); }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {/* Table or Message */}
        {leaveRequests.length === 0 ? (
          <div className="alert alert-info text-center">No {tab} leave requests.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Employee Name</th>
                  <th>Leave Types</th>
                  <th>Details</th>
                  <th>Dates Start and End</th>
                  {tab !== "pending" && <th>Status</th>}
                  {tab === "pending" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName} {request.lastName}</td> {/* ✅ Removed parentheses but kept last name */}
                    <td>{request.leave_types.length > 0 ? request.leave_types.join(", ") : "N/A"}</td>
                    <td>{request.leave_details}</td>
                    <td>
                      {new Date(request.inclusive_dates_start).toLocaleDateString()} to {" "}
                      {request.inclusive_dates_end ? new Date(request.inclusive_dates_end).toLocaleDateString() : "TBD"}
                    </td>
                    {tab !== "pending" && <td className={tab === "approved" ? "text-success" : "text-danger"}>{tab}</td>}
                    {tab === "pending" && (
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2 d-flex align-items-center"
                          onClick={() => handleAction(request.id, "Approved")}
                        >
                          <FaCheck className="me-1" /> Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center"
                          onClick={() => handleAction(request.id, "Rejected")}
                        >
                          <FaTimes className="me-1" /> Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestApproval;
