import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes, FaPrint, FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrintLeaveApplication from "./PrintLeaveApplication";

const LeaveRequestApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const pageSize = 5;

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
        toast.error(`Error fetching leave requests: ${error.message}`);
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [tab, page]);

  const handleAction = async (id, action) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));

    try {
      let body = { status: action.toLowerCase() };
      
      if (action === "Rejected") {
        const rejection_message = prompt("Please enter a reason for rejecting this request:");
        if (!rejection_message) {
          setLoadingStates(prev => ({ ...prev, [id]: false }));
          return;
        }
        body.rejection_message = rejection_message;
      }

      const response = await fetch(`http://localhost:8000/api/leaveapproval/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Leave request ${action.toLowerCase()} successfully!`);
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
      } else {
        toast.error(result.error || "Failed to update leave request");
      }
    } catch (error) {
      toast.error("An error occurred while updating the request.");
      console.error("Error updating leave request:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePrint = (request) => {
    setSelectedRequest(request);
    setShowPrintDialog(true);
  };

  const closePrintDialog = () => {
    setShowPrintDialog(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "warning",
      approved: "success",
      rejected: "danger"
    };
    return (
      <span className={`badge bg-${statusMap[status.toLowerCase()]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h4 className="text-center mb-4 fw-bold">Leave Request Approval</h4>
        
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

        {leaveRequests.length === 0 ? (
          <div className="alert alert-info text-center">
            No {tab} leave requests found.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Employee</th>
                    <th>Leave Types</th>
                    <th>Leave Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        {request.fullName} {request.lastName}
                        <div className="text-muted small">{request.position}</div>
                      </td>
                      <td>{request.leave_types.join(", ")}</td>
                      <td>
                        {request.leave_dates.map(date => (
                          <div key={date}>{date}</div>
                        ))}
                      </td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {tab === "pending" && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to approve this leave request?")) {
                                    handleAction(request.id, "Approved");
                                    toast.success("Leave request approved successfully!");
                                  }
                                }}
                                disabled={loadingStates[request.id]}
                              >
                                {loadingStates[request.id] ? (
                                  <FaSpinner className="fa-spin" />
                                ) : (
                                  <FaCheck />
                                )}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to reject this leave request?")) {
                                    handleAction(request.id, "Rejected");
                                  }
                                }}
                                disabled={loadingStates[request.id]}
                              >
                                {loadingStates[request.id] ? (
                                  <FaSpinner className="fa-spin" />
                                ) : (
                                  <FaTimes />
                                )}
                              </button>
                            </>
                          )}
                          {tab === "approved" && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handlePrint(request)}
                            >
                              <FaPrint />
                            </button>
                          )}
                        </div>
                        {tab === "rejected" && request.rejection_message && (
                          <div className="mt-2 small text-muted">
                            <strong>Reason:</strong> {request.rejection_message}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="btn btn-primary"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Print Dialog */}
      {showPrintDialog && selectedRequest && (
  <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050 }}>
    <div
      className="modal-content bg-white p-4 rounded"
      style={{
        width: '794px',  // A4 width in pixels
        height: '1123px', // A4 height in pixels
        maxWidth: '100%',  // Ensures responsiveness
        maxHeight: '90vh',  // Prevents overflow from the screen
        overflowY: 'auto', // Allows scroll if content overflows
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' // Optional: Adds some shadow for floating effect
      }}
    >
      <div className="d-flex justify-content-end">
        <button className="btn btn-sm btn-outline-secondary" onClick={closePrintDialog}>
          &times;
        </button>
      </div>
      <PrintLeaveApplication leaveRequest={selectedRequest} />
    </div>
  </div>
)}


    </div>
  );
};

export default LeaveRequestApproval;
