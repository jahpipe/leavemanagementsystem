import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const MyLeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Assume the logged-in user is stored in localStorage as "user"
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : null;

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8000/api/leave-balance/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch leave balances");
          return res.json();
        })
        .then((data) => {
          setBalances(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching leave balances:", error);
          setLoading(false);
        });
    }
  }, [userId]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = balances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(balances.length / itemsPerPage);

  const cancelLeaveRequest = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/leave/cancel-leave/${id}`, {
        method: "PUT",
      });
  
      if (!response.ok) {
        throw new Error("Failed to cancel leave request");
      }
  
      // Refresh leave requests
      fetchLeaveRequests(userId);
    } catch (error) {
      console.error("Error canceling leave request:", error);
    }
  };

  
  return (
    <div className="container mt-5">
      <h4 className="text-center mb-4">My Leave Balances</h4>
      {loading ? (
        <div className="text-center text-muted">Loading leave balances...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead className="table-dark">
                <tr>
                  <th>Leave Type</th>
                  <th>Total Credit</th>
                  <th>Used Credit</th>
                  <th>Remaining Credit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No leave balance data available.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((balance, index) => (
                    <tr key={index}>
                      <td>{balance.leaveTypeName}</td>
                      <td>{balance.total_credit}</td>
                      <td>{balance.used_credit}</td>
                      <td>{balance.remaining_credit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              </li>
              {[...Array(totalPages).keys()].map((number) => (
                <li key={number} className={`page-item ${currentPage === number + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(number + 1)}>
                    {number + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default MyLeaveBalance;
