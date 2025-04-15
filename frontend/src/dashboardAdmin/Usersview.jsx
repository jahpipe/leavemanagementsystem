import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import UsersInformation from './UsersInformation'; 

const UserView = () => {
  const [activeEditTab, setActiveEditTab] = useState('personal');
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
  const [isViewMode, setIsViewMode] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 
                err.message || 
                'Failed to fetch users');
        console.error('Error details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.fullName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      contact: user.contact || '',
      username: user.username || '',
      role: user.role || '',
      position: user.position || '',
      salary: user.salary || '',
      password: '',
      place_of_birth: user.place_of_birth || '',
      date_of_birth: user.date_of_birth || '',
      permanent_address: user.permanent_address || '',
      special_order_no: user.special_order_no || '',
      status_of_employment: user.status_of_employment || '',
      effective_date: user.effective_date || '',
      annual_salary: user.annual_salary || '',
      nature_of_appointment: user.nature_of_appointment || '',
      school_assignment: user.school_assignment || '',
    });
    setIsViewMode(false);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewMode(true);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setIsViewMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const currentUser = users.find(u => u.id === selectedUser.id);
      
      const employmentFields = [
        'position', 'salary', 'status_of_employment', 
        'special_order_no', 'nature_of_appointment', 
        'school_assignment', 'effective_date'
      ];
      
      const hasEmploymentChanges = employmentFields.some(
        field => editUser[field] !== currentUser[field]
      );
  
      const updateData = { 
        ...editUser,
        track_employment_changes: hasEmploymentChanges,
        current_employment_data: hasEmploymentChanges ? {
          position: currentUser.position,
          salary: currentUser.salary,
          status_of_employment: currentUser.status_of_employment,
          special_order_no: currentUser.special_order_no,
          nature_of_appointment: currentUser.nature_of_appointment,
          school_assignment: currentUser.school_assignment,
          effective_date: currentUser.effective_date
        } : null
      };
  
      if (!editUser.password) {
        delete updateData.password;
      }
  
      await axios.put(
        `http://localhost:8000/users/${selectedUser.id}`,
        updateData
      );
    
      const response = await axios.get('http://localhost:8000/users');
      setUsers(response.data);
      
      setSelectedUser(null);
      alert(hasEmploymentChanges 
        ? 'User updated with employment history recorded' 
        : 'User updated successfully');
      
    } catch (err) {
      console.error('Update failed:', err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:8000/users/${id}`);
      setUsers(prev => prev.filter(user => user.id !== id));
      alert('User deleted successfully');
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user. Please check if this user has any transactions.');
    }
  };

  if (loading) return <div className="text-center p-4">Loading users...</div>;
  if (error) return (
    <div className="alert alert-danger">
      <h4>Error Loading Users</h4>
      <p>{error}</p>
      <button 
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );

  const admins = users.filter(user => user.role === 'admin');
  const employees = users.filter(user => user.role === 'employee');

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
                  {getPaginatedData(admins, adminPage).map(admin => (
                    <tr key={admin.id}>
                      <td>{admin.username}</td>
                      <td>{admin.role}</td>
                      <td>{admin.position}</td>
                      <td>{admin.salary}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleViewUser(admin)}
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
            <Pagination 
              currentPage={adminPage}
              totalPages={Math.ceil(admins.length / itemsPerPage)}
              onPageChange={handleAdminPageChange}
            />
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
                  {getPaginatedData(employees, employeePage).map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.username}</td>
                      <td>{employee.role}</td>
                      <td>{employee.position}</td>
                      <td>{employee.salary}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleViewUser(employee)}
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
            <Pagination 
              currentPage={employeePage}
              totalPages={Math.ceil(employees.length / itemsPerPage)}
              onPageChange={handleEmployeePageChange}
            />
          </div>
        </div>
      )}

      {isViewMode && selectedUser && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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

      {!isViewMode && selectedUser && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeEditTab === 'personal' ? 'active' : ''}`}
                      onClick={() => setActiveEditTab('personal')}
                    >
                      Personal
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeEditTab === 'employment' ? 'active' : ''}`}
                      onClick={() => setActiveEditTab('employment')}
                    >
                      Employment
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeEditTab === 'account' ? 'active' : ''}`}
                      onClick={() => setActiveEditTab('account')}
                    >
                      Account
                    </button>
                  </li>
                </ul>

                {activeEditTab === 'personal' && (
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
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact</label>
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
                    <div className="col-12 mb-3">
                      <label className="form-label">Place of Birth</label>
                      <input
                        type="text"
                        name="place_of_birth"
                        value={editUser.place_of_birth}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Address</label>
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

                {activeEditTab === 'employment' && (
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
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Employment Status</label>
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
                    <div className="col-12 mb-3">
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
                )}

                {activeEditTab === 'account' && (
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
                    <div className="col-12 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editUser.password}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>
                  Cancel
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default UserView;