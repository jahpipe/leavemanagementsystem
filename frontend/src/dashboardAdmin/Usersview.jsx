  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
  import UsersInformation from './UsersInformation'; 

  const UserView = () => {
    // Add this line with your other state declarations
    const [activeEditTab, setActiveEditTab] = useState('personal');
    
    // Your existing state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editUser, setEditUser] = useState({
      fullName: '',
      middleName: '',
      lastName: '',
      contact: '',
      username: '',
      role: '',
      position: '',
      salary: '',
      password: '',
      place_of_birth: '',
      date_of_birth: '',
      permanent_address: '',
      special_order_no: '',
      status_of_employment: '',
      effective_date: '',
      annual_salary: '',
      nature_of_appointment: '',
      school_assignment: '',
    });
    const [activeTab, setActiveTab] = useState('admins');
    const [adminPage, setAdminPage] = useState(1);
    const [employeePage, setEmployeePage] = useState(1);
    const [isViewMode, setIsViewMode] = useState(false); // State to control view mode
    const itemsPerPage = 6;

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`);
          setUsers(response.data);
        } catch (err) {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, []);

    const handleUserClick = (user) => {
      setSelectedUser(user);
      setEditUser({
        fullName: user.fullName,
        middleName: user.middleName,
        lastName: user.lastName,
        contact: user.contact,
        username: user.username,
        role: user.role,
        position: user.position,
        salary: user.salary,
        password: '',
        place_of_birth: user.place_of_birth,
        date_of_birth: user.date_of_birth,
        permanent_address: user.permanent_address,
        special_order_no: user.special_order_no,
        status_of_employment: user.status_of_employment,
        effective_date: user.effective_date,
        annual_salary: user.annual_salary,
        nature_of_appointment: user.nature_of_appointment,
        school_assignment: user.school_assignment,
      });
      setIsViewMode(false); // Set to Edit Mode
    };

    const handleViewUser = (user) => {
      setSelectedUser(user);
      setIsViewMode(true); // Set to View Mode
    };

    const handleCloseDetails = () => {
      setSelectedUser(null);
      setIsViewMode(false); // Reset View Mode
    };

    const handleInputChange = (e) => {
      setEditUser({
        ...editUser,
        [e.target.name]: e.target.value,
      });
    };

    const handleSave = async () => {
      try {
        // Get current user data
        const currentUser = users.find(u => u.id === selectedUser.id);
        
        // Check which employment fields changed
        const employmentFields = [
          'position', 
          'salary', 
          'status_of_employment', 
          'special_order_no', 
          'nature_of_appointment', 
          'school_assignment',
          'effective_date'
        ];
        
        // Determine if any employment details changed
        const hasEmploymentChanges = employmentFields.some(
          field => editUser[field] !== currentUser[field]
        );
    
        // Prepare update data
        const updateData = { 
          ...editUser,
          track_employment_changes: hasEmploymentChanges,
          current_employment_data: hasEmploymentChanges ? currentUser : null
        };
    
        // Remove password from update if not changed
        if (!editUser.password) {
          delete updateData.password;
        }
    
        // Send update request
        const response = await axios.put(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${selectedUser.id}`,
          updateData
        );
    
        // Refresh user data
        const userResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`);
        setUsers(userResponse.data);
        
        // Close modal and show success message
        setSelectedUser(null);
        alert(hasEmploymentChanges 
          ? 'User updated with employment history recorded' 
          : 'User updated successfully');
        
      } catch (err) {
        console.error('Update failed:', err.response?.data || err);
        alert(`Error: ${err.response?.data?.message || err.message}`);
      }
    };

    const handleDelete = async (id) => {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this user? Make sure to double-check their transactions to avoid deleting transactions of users.'
      );
      if (!confirmDelete) return;

      try {
        await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${id}`);
        alert('User deleted successfully');
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
      } catch (err) {
        console.error('Failed to delete user', err.response ? err.response.data : err);
        alert('Failed to delete user. Please check if this user has any transactions.');
      }
    };

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-danger">{error}</p>;

    const admins = users.filter((user) => user.role === 'admin');
    const employees = users.filter((user) => user.role === 'employee');

    const getPaginatedData = (data, page) => {
      const startIndex = (page - 1) * itemsPerPage;
      return data.slice(startIndex, startIndex + itemsPerPage);
    };

    const handleAdminPageChange = (newPage) => {
      setAdminPage(newPage);
    };

    const handleEmployeePageChange = (newPage) => {
      setEmployeePage(newPage);
    };

    return (
      <div className="container py-4">
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('admins')}
            >
              Admins
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              Employees
            </button>
          </li>
        </ul>

        {activeTab === 'admins' && (
          <div className="card mb-4">
            <div className="card-header">Admins</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(admins, adminPage).map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.username}</td>
                        <td>{admin.role}</td>
                        <td>{admin.position}</td>
                        <td>{admin.salary}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => handleViewUser(admin)} // Use handleViewUser for View
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleUserClick(admin)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(admin.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${adminPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleAdminPageChange(adminPage - 1)}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.ceil(admins.length / itemsPerPage) }, (_, i) => (
                      <li key={i + 1} className={`page-item ${adminPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handleAdminPageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${adminPage === Math.ceil(admins.length / itemsPerPage) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleAdminPageChange(adminPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="card mb-4">
            <div className="card-header">Employees</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(employees, employeePage).map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.username}</td>
                        <td>{employee.role}</td>
                        <td>{employee.position}</td>
                        <td>{employee.salary}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => handleViewUser(employee)} // Use handleViewUser for View
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleUserClick(employee)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(employee.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${employeePage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleEmployeePageChange(employeePage - 1)}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.ceil(employees.length / itemsPerPage) }, (_, i) => (
                      <li key={i + 1} className={`page-item ${employeePage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handleEmployeePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${employeePage === Math.ceil(employees.length / itemsPerPage) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleEmployeePageChange(employeePage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Display UsersInformation in View Mode */}
        {isViewMode && selectedUser && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Information</h5>
                  <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
                </div>
                <div className="modal-body">
                  <UsersInformation user={selectedUser} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display Edit Modal in Edit Mode */}
        {!isViewMode && selectedUser && (
  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1">
    <div className="modal-dialog modal-lg modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit User Details</h5>
          <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
        </div>
        <div className="modal-body">
          {/* Tab Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeEditTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('personal')}
              >
                Personal Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeEditTab === 'employment' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('employment')}
              >
                Employment Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeEditTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('account')}
              >
                Account Information
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Personal Information Tab */}
            {activeEditTab === 'personal' && (
              <div className="tab-pane active">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editUser.fullName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={editUser.middleName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editUser.lastName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      name="contact"
                      value={editUser.contact}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editUser.date_of_birth}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Place of Birth</label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={editUser.place_of_birth}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Permanent Address</label>
                  <input
                    type="text"
                    name="permanent_address"
                    value={editUser.permanent_address}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* Employment Details Tab */}
            {activeEditTab === 'employment' && (
  <div className="tab-pane active">
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Position</label>
        <input
          type="text"
          name="position"
          value={editUser.position}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">Salary</label>
        <input
          type="number"
          name="salary"
          value={editUser.salary}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
    </div>
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Status of Employment</label>
        <select
          name="status_of_employment"
          value={editUser.status_of_employment}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="">Select Status</option>
          <option value="Permanent">Permanent</option>
          <option value="Probationary">Probationary</option>
          <option value="Contractual">Contractual</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">Special Order No.</label>
        <input
          type="text"
          name="special_order_no"
          value={editUser.special_order_no}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
    </div>
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Effective Date</label>
        <input
          type="date"
          name="effective_date"
          value={editUser.effective_date}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">Nature of Appointment</label>
        <input
          type="text"
          name="nature_of_appointment"
          value={editUser.nature_of_appointment}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
    </div>
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">School Assignment</label>
        <input
          type="text"
          name="school_assignment"
          value={editUser.school_assignment}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>
    </div>
  </div>
)}

            {/* Account Information Tab */}
            {activeEditTab === 'account' && (
              <div className="tab-pane active">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editUser.username}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      value={editUser.role}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={editUser.password}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter new password (leave empty to keep current)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    );
  };

  export default UserView;