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
    role: "employee",
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
      const { fullName, lastName, contact, username, password, role } = formData;
      await axios.post("http://localhost:8000/api/register", {
        fullName,
        lastName,
        contact,
        username,
        password,
        role,
      });

      const message =
        role === "employee"
          ? "Employee created successfully"
          : "Admin created successfully";

      setSuccess(message);
      setError("");
      window.alert(message);
      setFormData({
        fullName: "",
        lastName: "",
        contact: "",
        username: "",
        password: "",
        role: "employee",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred. Please try again."
      );
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
              {[
                { label: "Full Name", name: "fullName", type: "text" },
                { label: "Last Name", name: "lastName", type: "text" },
                { label: "Contact", name: "contact", type: "text" },
                { label: "Username", name: "username", type: "text" },
              ].map((field, index) => (
                <div className="col-md-6" key={index}>
                  <div className="form-floating">
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      required
                    />
                    <label>{field.label}</label>
                  </div>
                </div>
              ))}

              {/* Password Field with Show/Hide Toggle */}
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
                    style={{
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select rounded-3"
                  >
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                  <label>Role</label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-4 fw-semibold rounded-3"
            >
              Add User
            </button>
          </form>

          {error && (
            <div className="alert alert-danger mt-3 text-center">{error}</div>
          )}
          {success && (
            <div className="alert alert-success mt-3 text-center">{success}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAdd;
