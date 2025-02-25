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
    password: '' // Add password to the state
  });

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
      password: '' // Clear password field when editing
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
  
      // Conditionally remove password if it's left empty
      if (!editUser.password) {
        delete updateData.password;
      }
  
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${selectedUser.id}`,
        updateData
      );
      alert('User updated successfully');
      setSelectedUser(null);
  
      // Optionally, refresh the user list after update
      const userResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`);
      setUsers(userResponse.data);
    } catch (err) {
      console.error('Failed to update user', err.response ? err.response.data : err);
    }
  };
  


  // DELETE user handler
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this user? Make sure to double-check their transactions to avoid deleting transactions of users."
  );

  if (!confirmDelete) {
    return; // Exit the function if the user cancels
  }

  try {
    console.log('Attempting to delete user with ID:', id); // Check if the ID is correct

    const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${id}`);
    alert('User deleted successfully');

    // Refresh the user list after deletion
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
  } catch (err) {
    console.error('Failed to delete user', err.response ? err.response.data : err);
    alert('Failed to delete user. Please check if this user has any transactions.');
  }
};

  

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const clients = users.filter(user => user.role === 'client');
  const admins = users.filter(user => user.role === 'admin');

  return (
    <div className="relative flex p-6 bg-gray-100 min-h-screen">
      <div className="flex-1 max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Admins Table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 p-4 bg-gray-200">Admins</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Full Name</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Last Name</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Username</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Role</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="p-3 text-sm text-gray-500">{admin.fullName}</td>
                    <td className="p-3 text-sm text-gray-500">{admin.lastName}</td>
                    <td className="p-3 text-sm text-gray-500">{admin.contact}</td>
                    <td className="p-3 text-sm text-gray-500">{admin.username}</td>
                    <td className="p-3 text-sm text-gray-500">{admin.role}</td>
                    <td className="p-3 text-sm text-gray-500">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={() => handleUserClick(admin)}
                        >
                        Edit
                      </button>
                      <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(client.id)}
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

        {/* Clients Table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 p-4 bg-gray-200">Customer</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Full Name</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Last Name</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Username</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Role</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="p-3 text-sm text-gray-500">{client.fullName}</td>
                    <td className="p-3 text-sm text-gray-500">{client.lastName}</td>
                    <td className="p-3 text-sm text-gray-500">{client.contact}</td>
                    <td className="p-3 text-sm text-gray-500">{client.username}</td>
                    <td className="p-3 text-sm text-gray-500">{client.role}</td>
                    <td className="p-3 text-sm text-gray-500">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={() => handleUserClick(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(client.id)}
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

      {/* Floating panel for editing user details */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-6xl bg-white shadow-lg p-6 overflow-y-auto">
            <button
              onClick={handleCloseDetails}
              className="text-gray-500 hover:text-gray-700 mb-4"
            >
              Close
            </button>

            <h3 className="text-lg font-semibold mb-4">Edit User Details</h3>

            <form>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editUser.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editUser.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={editUser.contact}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editUser.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={editUser.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter new password (leave empty to keep current)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={editUser.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;