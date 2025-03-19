import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes, FaPrint, FaPaperPlane } from "react-icons/fa";
import PrintLeaveApplication from "./PrintLeaveApplication"; 

const LeaveRequestApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messageText, setMessageText] = useState({});
  const [showPrintDialog, setShowPrintDialog] = useState(false); // State to control print dialog visibility
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
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [tab, page]);

  const handleAction = async (id, status) => {
    let rejection_message = "";
  
    if (status === "Rejected") {
      rejection_message = prompt("Please enter a reason for rejecting this request:");
      if (!rejection_message) return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/api/leaveapproval/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.toLowerCase(), rejection_message }), // Using correct field name
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
  

  const handleSendMessage = async (id) => {
    const message = messageText[id];

    if (!message) {
      alert("Please enter a message before sending.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/leaveapproval/${id}/sendmessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setMessageText((prev) => ({ ...prev, [id]: "" })); // Clear input after sending
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message.");
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
          <div className="alert alert-info text-center">No {tab} leave requests.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Employee Name</th>
                  <th>Leave Types</th>
                  <th>Leave Dates</th>
                  {tab === "pending" ? <th>Action</th> : <th>Status</th>}
                  {tab === "approved" && <th>Print</th>}
                  {tab === "rejected" && <th>Message</th>}
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName} {request.lastName}</td>
                    <td>{request.leave_types.join(", ")}</td>
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
                            if (window.confirm("Are you sure you want to reject this request?")) {
                              handleAction(request.id, "Rejected");
                            }
                          }}
                        >
                          <FaTimes className="me-1" />
                        </button>
                      </td>
                    ) : (
                      <td className={request.status.toLowerCase() === "approved" ? "text-success" : "text-danger"}>
                        {request.status}
                      </td>
                    )}

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

                    {tab === "rejected" && (
                      <td>
                      {request.rejection_message ? (
                        <span>{request.rejection_message}</span>
                      ) : (
                        <span className="text-muted">No message provided</span>
                      )}
                    </td>
                    
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

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

      {/* Floating Modal for PrintLeaveApplication */}
      {showPrintDialog && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
              onClick={closePrintDialog}
            >
              &times;
            </button>
            <PrintLeaveApplication leaveRequest={selectedRequest} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestApproval;