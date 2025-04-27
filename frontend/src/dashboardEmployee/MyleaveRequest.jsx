import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const MyLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  const handleCancelClick = (request) => {
    setSelectedRequest(request);
    setShowCancelModal(true);
  };

  const cancelLeaveRequest = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/leave/cancel-leave/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        const errorMsg = result.error || 
                        result.details?.message || 
                        "Failed to cancel leave request";
        throw new Error(errorMsg);
      }
  
      alert(result.message);
      fetchLeaveRequests(userId); // Refresh the list
      setShowCancelModal(false);
      
    } catch (error) {
      console.error("Cancellation error:", error);
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
    <div className="container mt-4">
      {/* Confirmation Modal */}
      <div className={`modal fade ${showCancelModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showCancelModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title">Confirm Cancellation</h5>
              <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this leave request?</p>
              {selectedRequest && (
                <div className="alert alert-light">
                  <strong>Leave Type:</strong> {selectedRequest.leave_types?.join(", ")}<br />
                  <strong>Dates:</strong> {selectedRequest.leave_dates?.join(", ")}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                Close
              </button>
              <button type="button" className="btn btn-warning" onClick={cancelLeaveRequest}>
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">My Leave Requests</h4>
        </div>
        
        <div className="card-body">
          <ul className="nav nav-pills mb-4">
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
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading leave requests...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
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
                        <td colSpan={filter === "Rejected" ? "5" : "4"} className="text-center py-4">
                          <div className="alert alert-info mb-0">
                            No leave requests found for this filter.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((request, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar-event me-2"></i>
                              {request.leave_types ? request.leave_types.join(", ") : ""}
                            </div>
                          </td>
                          <td>{request.number_of_days || ""}</td>
                          <td>
                            <small className="text-muted">
                              {request.leave_dates ? request.leave_dates.join(", ") : ""}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill ${
                                request.status === "Approved"
                                  ? "bg-success"
                                  : request.status === "Rejected"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                          {filter === "Rejected" && (
                            <td className="text-danger">
                              <i className="bi bi-exclamation-triangle-fill me-1"></i>
                              {request.rejection_message ? request.rejection_message : "No reason provided"}
                            </td>
                          )}
                          {filter === "Pending" && (
                            <td>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelClick(request)}
                              >
                                <i className="bi bi-x-circle me-1"></i>Cancel
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredRequests.length > itemsPerPage && (
                <nav aria-label="Page navigation" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLeaveRequest;