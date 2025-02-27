import React, { useState } from "react";

const LeaveApproval = () => {
  const [requests, setRequests] = useState([
    { id: 1, name: "John Doe", type: "Sick Leave", status: "Pending" },
    { id: 2, name: "Jane Smith", type: "Annual Leave", status: "Pending" },
  ]);

  const handleApproval = (id, status) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Leave Applications</h2>
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Leave Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.name}</td>
                <td>{request.type}</td>
                <td className="font-weight-bold">{request.status}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApproval(request.id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleApproval(request.id, "Rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApproval;
