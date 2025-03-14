import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes, FaPrint } from "react-icons/fa";
import PrintLeaveApplication from "./PrintLeaveApplication"; // Import the print component

const LeaveRequestApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // State to track selected request
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
          `http://localhost:8000/api/leaveapproval/${tab}?page=${page}&limit=${pageSize}`
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
  }, [tab, page]);

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

  const handlePrint = (request) => {
    setSelectedRequest(request); // Set the selected request
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h4 className="text-center mb-4 fw-bold">Leave Request Approval</h4>
        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          {["pending", "approved", "rejected"].map((status) => (
            <li className="nav-item" key={status}>
              <button
                className={`nav-link ${tab === status ? "active" : ""}`}
                onClick={() => {
                  setTab(status);
                  setPage(1);
                }}
              >
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
                  <th>Leave Dates</th>
                  {tab === "pending" ? <th>Action</th> : <th>Status</th>}
                  {tab === "approved" && <th>Print</th>} {/* Show "Print" column only in the "Approved" tab */}
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName} {request.lastName}</td>
                    <td>{request.leave_types.join(", ")}</td>
                    <td>{parseDetails(request.leave_details)}</td>
                    <td>{request.leave_dates.join(", ")}</td>
                    {tab === "pending" ? (
                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to approve this request?")) {
                              handleAction(request.id, "Approved");
                            }
                          }}
                        >
                          <FaCheck className="me-1" />
                        </button>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to disapprove this request?")) {
                              handleAction(request.id, "Rejected");
                            }
                          }}
                        >
                          <FaTimes className="me-1" />
                        </button>
                      </td>
                    ) : (
                      <td
                        className={
                          request.status.toLowerCase() === "approved"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {request.status}
                      </td>
                    )}
                    {/* Show "Print" button only in the "Approved" tab */}
                    {tab === "approved" && (
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePrint(request)}
                        >
                          <FaPrint />
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

      {/* Render the PrintLeaveApplication component in a modal or new window */}
      {selectedRequest && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Print Leave Application</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                ></button>
              </div>
              <div className="modal-body">
                <PrintLeaveApplication leaveRequest={selectedRequest} />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestApproval;