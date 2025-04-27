import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const MyLeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
          const processedData = data.map(item => ({
            ...item,
            used_credit: item.total_credit - item.remaining_credit
          }));
          setBalances(processedData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching leave balances:", error);
          setLoading(false);
        });
    }
  }, [userId]);

  const formatNumber = (num) => parseFloat(num).toFixed(2);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = balances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(balances.length / itemsPerPage);

  return (
    <div className="container my-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">My Leave Balances</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-bordered text-center align-middle">
                  <thead className="table-light">
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
                        <td colSpan="4" className="text-muted">No leave balance data available.</td>
                      </tr>
                    ) : (
                      currentItems.map((balance, index) => (
                        <tr key={index}>
                          <td>{balance.leaveTypeName}</td>
                          <td>{formatNumber(balance.total_credit)}</td>
                          <td>{formatNumber(balance.used_credit)}</td>
                          <td>{formatNumber(balance.remaining_credit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
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

export default MyLeaveBalance;
