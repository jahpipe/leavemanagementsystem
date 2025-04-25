import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash, FaPlus, FaSearch, FaEye, FaCalendarPlus, FaHistory } from "react-icons/fa";
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageBalance = () => {
  const [balances, setBalances] = useState({});
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [newBalance, setNewBalance] = useState({ 
    user_id: "", 
    leave_type_id: "", 
    total_credit: 1.25 // Default to 1.25
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccrualModal, setShowAccrualModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [accrualHistory, setAccrualHistory] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveTypes();
    fetchBalances();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      setEmployees(await response.json());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load employees");
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/leave-types");
      if (!response.ok) throw new Error("Failed to fetch leave types");
      setLeaveTypes(await response.json());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leave types");
    }
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/leave-balance/all");
      if (!response.ok) throw new Error("Failed to fetch leave balances");
      const data = await response.json();

      const groupedData = data.reduce((acc, balance) => {
        if (!acc[balance.fullName]) acc[balance.fullName] = [];
        acc[balance.fullName].push(balance);
        return acc;
      }, {});

      setBalances(groupedData);
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyAccrual = async (balance) => {
    if (!window.confirm(`Add 1.25 credits to ${balance.fullName}'s ${balance.leaveTypeName} balance?`)) return;
    
    try {
      const response = await fetch("http://localhost:8000/api/leave-balance/monthly-accrual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: balance.user_id,
          leave_type_id: balance.leave_type_id
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to process monthly accrual");
      }
      
      toast.success(result.message);
      fetchBalances();
    } catch (error) {
      toast.error(error.message);
      console.error("Accrual error:", error);
    }
  };
  
  const viewAccrualHistory = async (balance) => {
    setSelectedBalance(balance);
    try {
      const response = await fetch(
        `http://localhost:8000/api/leave-balance/accrual-history/${balance.user_id}/${balance.leave_type_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch accrual history");
      const data = await response.json();
      setAccrualHistory(data);
      setShowAccrualModal(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this balance?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/leave-balance/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) throw new Error("Failed to delete balance");
      
      toast.success("Balance deleted successfully");
      fetchBalances();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    setNewBalance({ ...newBalance, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!newBalance.user_id || !newBalance.leave_type_id) {
        throw new Error("Please select both employee and leave type");
      }
  
      const creditsToAdd = Number(newBalance.total_credit) || 1.25;
      
      // Add confirmation dialog for large credit additions
      if (creditsToAdd > 5 && !window.confirm(
        `Are you sure you want to add ${creditsToAdd} credits? This is a manual adjustment.`
      )) return;
  
      // Get current user from localStorage or your auth system
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser?.id) {
        throw new Error("No authenticated user found");
      }
  
      const response = await fetch("http://localhost:8000/api/leave-balance/add-credit", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        },
        body: JSON.stringify({
          user_id: Number(newBalance.user_id),
          leave_type_id: Number(newBalance.leave_type_id),
          creditsToAdd: creditsToAdd,
          notes: newBalance.reason || null,
          recorded_by: currentUser.id, // Add the recorded_by field
          accrual_start_date: new Date().toISOString().split('T')[0], // Add today's date
          is_manual: true // Flag to indicate this is a manual adjustment
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add balance");
      }
      
      toast.success(`${creditsToAdd} credits added successfully`);
      setNewBalance({ user_id: "", leave_type_id: "", total_credit: 1.25, reason: "" });
      fetchBalances();
      setActiveTab("view");
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || "Failed to add balance");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const filteredBalances = Object.entries(balances).filter(([employeeName]) =>
    employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBalances.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '42px',
      borderRadius: '8px',
      borderColor: '#ced4da',
      '&:hover': {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2684FF' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: '#DEEBFF'
      }
    })
  };

  const AccrualHistoryModal = () => (
    <div className={`modal fade ${showAccrualModal ? 'show d-block' : ''}`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              Monthly Accruals for {selectedBalance?.fullName} - {selectedBalance?.leaveTypeName}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowAccrualModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6>Monthly Summary</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="text-end">Accruals</th>
                      <th className="text-end">Total Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accrualHistory.monthlySummary?.map(month => {
                      // Ensure total is treated as a number
                      const total = Number(month.total) || 0;
                      return (
                        <tr key={month.month}>
                          <td>{month.month}</td>
                          <td className="text-end">{month.count}</td>
                          <td className="text-end fw-bold text-success">
                            +{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
  
            <h6>Detailed History</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-end">Amount</th>
                    <th>Recorded At</th>
                  </tr>
                </thead>
                <tbody>
  {accrualHistory.details?.map(record => (
    <tr key={record.id}>
      <td>{new Date(record.accrual_date).toLocaleDateString()}</td>
      <td className="text-end fw-bold text-success">
        +{parseFloat(record.credit_amount).toFixed(2)}
        {record.is_manual && (
          <span className="badge bg-warning text-dark ms-2">Manual</span>
        )}
      </td>
      <td>
        {new Date(record.recorded_at).toLocaleString()}
        {record.notes && (
          <div className="text-muted small mt-1">
            <strong>Reason:</strong> {record.notes}
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => setShowAccrualModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      {showAccrualModal && <AccrualHistoryModal />}
      
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <i className="fas fa-calendar-alt me-2"></i>
              Employee Leave Balances
            </h3>
            <div>
              <button 
                className={`btn btn-sm ${activeTab === "view" ? "btn-light" : "btn-outline-light"}`}
                onClick={() => setActiveTab("view")}
              >
                <FaEye className="me-1" /> View Balances
              </button>
              <button 
                className={`btn btn-sm ms-2 ${activeTab === "add" ? "btn-light" : "btn-outline-light"}`}
                onClick={() => setActiveTab("add")}
              >
                <FaPlus className="me-1" /> Add Balance
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {activeTab === "view" ? (
            <div className="p-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-3">Loading leave balances...</span>
                </div>
              ) : error ? (
                <div className="alert alert-danger text-center py-4">
                  <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <h5>Error Loading Data</h5>
                  <p className="mb-0">{error}</p>
                  <button 
                    className="btn btn-sm btn-primary mt-3"
                    onClick={fetchBalances}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '25%' }}>Employee</th>
                          <th style={{ width: '20%' }}>Leave Type</th>
                          <th style={{ width: '15%' }} className="text-end">Total</th>
  
                          <th style={{ width: '15%' }} className="text-end">Balance</th>
                          <th style={{ width: '10%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map(([employeeName, balanceList]) => (
                          <React.Fragment key={employeeName}>
                            {balanceList.map((balance, index) => (
                              <tr key={balance.id}>
                                {index === 0 && (
                                  <td rowSpan={balanceList.length} className="fw-bold align-middle">
                                    <div className="d-flex align-items-center">
                                      <div className="flex-shrink-0 me-2">
                                        <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center">
                                          <span className="text-primary fw-bold">
                                            {employeeName.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex-grow-1">
                                        {employeeName}
                                      </div>
                                    </div>
                                  </td>
                                )}
                                <td>
                                  <span className="badge bg-info text-dark">
                                    {balance.leaveTypeName}
                                  </span>
                                  </td>
                               <td className="text-end">
                                    {Number(balance.total_credit).toFixed(2)}
                                  </td>
                                
                                  <td className={`text-end fw-bold ${
                                    balance.remaining_credit < 5 ? "text-danger" : "text-success"
                                  }`}>
                                    {Number(balance.remaining_credit).toFixed(2)}
                                  </td>
                                     <td className="align-middle">
                                     <div className="d-flex">
                                    <button
                                      className="btn btn-sm btn-outline-primary me-1"
                                      onClick={() => handleMonthlyAccrual(balance)}
                                      title="Add Monthly Accrual"
                                    >
                                      <FaCalendarPlus />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-info me-1"
                                      onClick={() => viewAccrualHistory(balance)}
                                      title="View Accrual History"
                                    >
                                      <FaHistory />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDelete(balance.id)}
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            {searchTerm ? (
                              <div>
                                <i className="fas fa-search fa-2x text-muted mb-3"></i>
                                <h5>No matching records found</h5>
                                <p>Try adjusting your search query</p>
                              </div>
                            ) : (
                              <div>
                                <i className="fas fa-database fa-2x text-muted mb-3"></i>
                                <h5>No leave balance records available</h5>
                                <p>Add new leave balances to get started</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    </table>
                  </div>

                  {filteredBalances.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBalances.length)} of {filteredBalances.length} entries
                      </div>
                      <nav>
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(currentPage - 1)}
                            >
                              Previous
                            </button>
                          </li>
                          {Array.from({ length: Math.ceil(filteredBalances.length / itemsPerPage) }, (_, i) => (
                            <li 
                              key={i + 1} 
                              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                              <button 
                                className="page-link" 
                                onClick={() => paginate(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === Math.ceil(filteredBalances.length / itemsPerPage) ? "disabled" : ""}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(currentPage + 1)}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="p-3">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-plus-circle me-2 text-primary"></i>
                    Add New Leave Balance
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Employee</label>
                        <Select
                          options={employees.map(emp => ({ 
                            value: emp.id, 
                            label: emp.fullName 
                          }))}
                          value={employees.find(emp => emp.id === newBalance.user_id) 
                            ? { 
                                value: newBalance.user_id, 
                                label: employees.find(emp => emp.id === newBalance.user_id).fullName 
                              } 
                            : null}
                          onChange={selectedOption => handleChange({ 
                            target: { name: "user_id", value: selectedOption.value } 
                          })}
                          isSearchable
                          placeholder="Select employee..."
                          styles={customSelectStyles}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Leave Type</label>
                        <Select
                          options={leaveTypes.map(type => ({ 
                            value: type.id, 
                            label: type.name 
                          }))}
                          value={leaveTypes.find(type => type.id === newBalance.leave_type_id) 
                            ? { 
                                value: newBalance.leave_type_id, 
                                label: leaveTypes.find(type => type.id === newBalance.leave_type_id).name 
                              } 
                            : null}
                          onChange={selectedOption => handleChange({ 
                            target: { name: "leave_type_id", value: selectedOption.value } 
                          })}
                          isSearchable
                          placeholder="Select leave type..."
                          styles={customSelectStyles}
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-4">
  <div className="col-md-6">
    <label className="form-label">Credit Amount</label>
    <input
      type="number"
      className="form-control"
      name="total_credit"
      value={newBalance.total_credit}
      onChange={handleChange}
      step="0.01"
      min="0"
      placeholder="Enter credit amount"
    />
  </div>
  <div className="col-md-6">
    <label className="form-label">Reason for Adjustment</label>
    <input
      type="text"
      className="form-control"
      name="reason"
      value={newBalance.reason || ""}
      onChange={handleChange}
      placeholder="e.g., Special approval, Sick leave adjustment"
    />
  </div>
</div>
                    <div className="d-flex justify-content-end">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary me-2"
                        onClick={() => {
                          setActiveTab("view");
                          setNewBalance({ user_id: "", leave_type_id: "", total_credit: 1.25 });
                        }}
                      >
                        Cancel

                      </button>
                      <button type="submit" className="btn btn-primary">
                        <FaPlus className="me-1" /> Add Balance
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBalance;