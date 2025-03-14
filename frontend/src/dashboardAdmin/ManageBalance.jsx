import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Select from 'react-select';

const ManageBalance = () => {
  const [balances, setBalances] = useState({});
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [newBalance, setNewBalance] = useState({ user_id: "", leave_type_id: "", total_credit: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  
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
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/leave-types");
      if (!response.ok) throw new Error("Failed to fetch leave types");
      setLeaveTypes(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBalances = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/leave-balance/all");
      if (!response.ok) throw new Error("Failed to fetch leave balances");
      const data = await response.json();

      const groupedData = data.reduce((acc, balance) => {
        if (!acc[balance.fullName]) acc[balance.fullName] = [];
        acc[balance.fullName].push(balance);
        return acc;
      }, {});

      setBalances(groupedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this balance?")) return;
    try {
      await fetch(`http://localhost:8000/api/leave-balance/${id}`, { method: "DELETE" });
      fetchBalances();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    setNewBalance({ ...newBalance, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8000/api/leave-balance/add-credit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(newBalance.user_id),
          leave_type_id: Number(newBalance.leave_type_id),
          creditsToAdd: Number(newBalance.total_credit),
        }),
      });
      setNewBalance({ user_id: "", leave_type_id: "", total_credit: "" });
      fetchBalances();
      setActiveTab("view");
    } catch (error) {
      alert(error.message);
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

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-primary">Manage Employee Leave Balances</h3>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "view" ? "active" : ""}`} onClick={() => setActiveTab("view")}>
            View Balances
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>
            Add Balance
          </button>
        </li>
      </ul>

      {activeTab === "view" && (
        <div className="p-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" role="alert">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <>
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Employee Leave Balances</h5>
                  <div className="input-group w-25">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <span className="input-group-text"><i className="fas fa-search"></i></span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover border">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col">Employee</th>
                          <th scope="col">Leave Type</th>
                          <th scope="col">Total Earned</th>
                          <th scope="col">Less this Application</th>
                          <th scope="col">Balance</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map(([employeeName, balanceList]) => (
                          <React.Fragment key={employeeName}>
                            {balanceList.map((balance, index) => (
                              <tr key={balance.id}>
                                {index === 0 && <td rowSpan={balanceList.length} className="fw-bold">{employeeName}</td>}
                                <td>{balance.leaveTypeName}</td>
                                <td>{balance.total_credit}</td>
                                <td>{balance.used_credit}</td>
                                <td className={balance.remaining_credit < 5 ? "text-danger fw-bold" : ""}>
                                  {balance.remaining_credit}
                                </td>
                                {index === 0 && (
                                  <td rowSpan={balanceList.length}>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDelete(balance.id)}
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <ul className="pagination mb-0">
                    {Array.from({ length: Math.ceil(filteredBalances.length / itemsPerPage) }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button onClick={() => paginate(i + 1)} className="page-link">
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === Math.ceil(filteredBalances.length / itemsPerPage)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    {activeTab === "add" && (
  <div className="card p-3 shadow">
    <h5>Add Leave Balance</h5>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Employee Name</label>
        <Select
          options={employees.map(emp => ({ value: emp.id, label: emp.fullName }))}
          value={employees.find(emp => emp.id === newBalance.user_id) 
            ? { value: newBalance.user_id, label: employees.find(emp => emp.id === newBalance.user_id).fullName } 
            : null}
          onChange={selectedOption => handleChange({ target: { name: "user_id", value: selectedOption.value } })}
          isSearchable
          styles={{
            control: (base) => ({ ...base, color: "black", backgroundColor: "white" }),
            singleValue: (base) => ({ ...base, color: "black" }),
            input: (base) => ({ ...base, color: "black" }),
            menu: (base) => ({ ...base, backgroundColor: "white" }),
            option: (base, state) => ({
              ...base,
              color: state.isSelected ? "white" : "black",
              backgroundColor: state.isSelected ? "#007bff" : "white",
            }),
          }}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Leave Type</label>
        <Select
          options={leaveTypes.map(type => ({ value: type.id, label: type.name }))}
          value={leaveTypes.find(type => type.id === newBalance.leave_type_id) 
            ? { value: newBalance.leave_type_id, label: leaveTypes.find(type => type.id === newBalance.leave_type_id).name } 
            : null}
          onChange={selectedOption => handleChange({ target: { name: "leave_type_id", value: selectedOption.value } })}
          isSearchable
          styles={{
            control: (base) => ({ ...base, color: "black", backgroundColor: "white" }),
            singleValue: (base) => ({ ...base, color: "black" }),
            input: (base) => ({ ...base, color: "black" }),
            menu: (base) => ({ ...base, backgroundColor: "white" }),
            option: (base, state) => ({
              ...base,
              color: state.isSelected ? "white" : "black",
              backgroundColor: state.isSelected ? "#007bff" : "white",
            }),
          }}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Total Credit</label>
        <input
          type="number"
          className="form-control"
          name="total_credit"
          value={newBalance.total_credit}
          onChange={handleChange}
          required
          style={{ color: "black", backgroundColor: "white" }}
        />
      </div>
      <button type="submit" className="btn btn-success">Add Balance</button>
    </form>
  </div>
)}
    </div>
  );
};

export default ManageBalance;