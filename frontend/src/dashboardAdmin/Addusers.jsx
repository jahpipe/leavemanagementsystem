import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const UserAdd = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    contact: "",
    username: "",
    password: "",
    role: "client",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { fullName, lastName, contact, username, password, role } = formData;
      const response = await axios.post(
        "http://localhost:8000/api/register", // Manually define URL for testing
        { fullName, lastName, contact, username, password, role }
      );
      

      setSuccess(response.data.message);
      setError("");
      window.alert(response.data.message);
      setFormData({
        fullName: "",
        lastName: "",
        contact: "",
        username: "",
        password: "",
        role: "client",
      });
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="col-md-8 mx-auto">
        <div className="card shadow-lg p-4">
          {/* Title on Top */}
          <div className="text-center mb-3">
            <h2 className="fw-bold text-primary">Add New User</h2>
            <hr className="mt-2 mb-4" />
          </div>

          {/* Form Start */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="admin">Admin</option>
                  <option value="client">Employee</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100 mt-4 fw-semibold">
              Add User
            </button>
          </form>

          {/* Success & Error Messages */}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
          {success && <div className="alert alert-success mt-3 text-center">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserAdd;
