import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const UserAdd = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    middleName: "",
    lastName: "",
    contact: "",
    username: "",
    password: "",
    role: "employee",
    position: "",
    salary: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { fullName, middleName, lastName, contact, username, password, role, position, salary } = formData;

      await axios.post("http://localhost:8000/api/register", {
        fullName,
        middleName,
        lastName,
        contact,
        username,
        password,
        role,
        position,
        salary: salary ? parseFloat(salary) : null, // Ensure salary is a number
      });

      setSuccess("User created successfully");
      setError("");
      window.alert("User created successfully");

      setFormData({
        fullName: "",
        middleName: "",
        lastName: "",
        contact: "",
        username: "",
        password: "",
        role: "employee",
        position: "",
        salary: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="col-lg-6 col-md-8 mx-auto">
        <div className="card shadow-sm p-4 rounded-4 border-0">
          <div className="text-center mb-3">
            <h2 className="fw-bold text-primary">Add New User</h2>
            <hr className="mt-2 mb-4" />
          </div>

          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                  <label>First Name</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                  <label>Middle Name</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                  <label>Last Name</label>
                </div>
              </div>

              {["contact", "username", "position"].map((field, index) => (
                <div className="col-md-6" key={index}>
                  <div className="form-floating">
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      required
                    />
                    <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
                  </div>
                </div>
              ))}

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    step="0.01"
                    min="0"
                    required
                  />
                  <label>Salary</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control rounded-3"
                    required
                  />
                  <label>Password</label>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="btn btn-sm btn-outline-secondary position-absolute"
                    style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <select name="role" value={formData.role} onChange={handleChange} className="form-select rounded-3">
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                  <label>Role</label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-4 fw-semibold rounded-3">
              Add User
            </button>
          </form>

          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
          {success && <div className="alert alert-success mt-3 text-center">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserAdd;
