import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState({
    fullName: '',
    lastName: '',
    contact: '',
    username: '',
    role: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState('admins');

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
      lastName: user.lastName,
      contact: user.contact,
      username: user.username,
      role: user.role,
      password: '' // Clear the password field when editing
    });
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    setEditUser({
      ...editUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const updateData = { ...editUser };
      // Remove password from update if it's empty
      if (!editUser.password) {
        delete updateData.password;
      }
      // Include credit_balance for employees
      if (editUser.role === 'employee') {
        updateData.credit_balance = editUser.credit_balance || 0;
      }
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${selectedUser.id}`,
        updateData
      );
      alert('User updated successfully');
      setSelectedUser(null);
  
      // Refresh the user list after update
      const userResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`);
      setUsers(userResponse.data);
    } catch (err) {
      console.error('Failed to update user', err.response ? err.response.data : err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? Make sure to double-check their transactions to avoid deleting transactions of users."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${id}`);
      alert('User deleted successfully');
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
    } catch (err) {
      console.error('Failed to delete user', err.response ? err.response.data : err);
      alert('Failed to delete user. Please check if this user has any transactions.');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  const admins = users.filter(user => user.role === 'admin');
  const employees = users.filter(user => user.role === 'employee');

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
          <div className="card-header">
            Admins
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Last Name</th>
                    <th>Contact</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.fullName}</td>
                      <td>{admin.lastName}</td>
                      <td>{admin.contact}</td>
                      <td>{admin.username}</td>
                      <td>{admin.role}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleUserClick(admin)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(admin.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="card mb-4">
          <div className="card-header">
            Employees
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Last Name</th>
                    <th>Contact</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Credit Balance</th> {/* New Column */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.fullName}</td>
                      <td>{employee.lastName}</td>
                      <td>{employee.contact}</td>
                      <td>{employee.username}</td>
                      <td>{employee.role}</td>
                      <td>{employee.credit_balance || 0}</td> {/* Display credit balance */}
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleUserClick(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap Modal for Editing User Details */}
      {selectedUser && (
  <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
    <div className="modal-dialog modal-lg modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit User Details</h5>
          <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
        </div>
        <div className="modal-body">
          <form>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={editUser.fullName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={editUser.lastName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact</label>
              <input
                type="text"
                name="contact"
                value={editUser.contact}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={editUser.username}
                onChange={handleInputChange}
                className="form-control"
              />
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
            <div className="mb-3">
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

            {editUser.role === 'employee' && (
              <div className="mb-3">
                <label className="form-label">Credit Balance</label>
                <input
                  type="number"
                  step="0.01"
                  name="credit_balance"
                  value={editUser.credit_balance || 0}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            )}
          </form>
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
