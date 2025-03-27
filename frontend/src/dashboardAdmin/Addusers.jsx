import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash, FaUserPlus, FaIdCard, FaMoneyBillWave, FaHome, FaSchool, FaCalendarAlt, FaLock } from "react-icons/fa";

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
    place_of_birth: "",
    date_of_birth: "",
    permanent_address: "",
    special_order_no: "",
    status_of_employment: "",
    effective_date: "",
    nature_of_appointment: "",
    school_assignment: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

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
      await axios.post("http://localhost:8000/api/register", {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      });

      setSuccess("User created successfully");
      setError("");
      window.alert("User created successfully");

      // Reset form
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
        place_of_birth: "",
        date_of_birth: "",
        permanent_address: "",
        special_order_no: "",
        status_of_employment: "",
        effective_date: "",
        nature_of_appointment: "",
        school_assignment: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
      setSuccess("");
    }
  };

  const fieldGroups = {
    personal: [
      { name: "fullName", label: "First Name", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "middleName", label: "Middle Name", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "lastName", label: "Last Name", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "contact", label: "Contact Number", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "place_of_birth", label: "Place of Birth", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "date_of_birth", label: "Date of Birth", icon: <FaCalendarAlt className="me-2" />, type: "date" },
      { name: "permanent_address", label: "Permanent Address", icon: <FaHome className="me-2" />, type: "text" },
    ],
    employment: [
      { name: "position", label: "Position", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "salary", label: "Salary", icon: <FaMoneyBillWave className="me-2" />, type: "number" },
      { name: "special_order_no", label: "Special Order No", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "status_of_employment", label: "Employment Status", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "effective_date", label: "Effective Date", icon: <FaCalendarAlt className="me-2" />, type: "date" },
      { name: "nature_of_appointment", label: "Nature of Appointment", icon: <FaIdCard className="me-2" />, type: "text" },
      { name: "school_assignment", label: "School Assignment", icon: <FaSchool className="me-2" />, type: "text" },
    ],
    account: [
      { name: "username", label: "Username", icon: <FaIdCard className="me-2" />, type: "text" },
      { 
        name: "password", 
        label: "Password", 
        icon: <FaLock className="me-2" />, 
        type: showPassword ? "text" : "password",
        extra: (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="btn btn-sm btn-outline-secondary position-absolute"
            style={{ top: "10px", right: "10px" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )
      },
      { 
        name: "role", 
        label: "Role", 
        icon: <FaIdCard className="me-2" />, 
        type: "select",
        options: ["admin", "employee"] 
      },
    ]
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex align-items-center">
                <FaUserPlus className="fs-4 me-2" />
                <h2 className="h4 mb-0 fw-bold">Add New User</h2>
              </div>
            </div>

            <div className="card-body p-0">
              <ul className="nav nav-tabs nav-fill border-bottom">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "personal" ? "active" : ""}`}
                    onClick={() => setActiveTab("personal")}
                  >
                    Personal Information
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "employment" ? "active" : ""}`}
                    onClick={() => setActiveTab("employment")}
                  >
                    Employment Details
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === "account" ? "active" : ""}`}
                    onClick={() => setActiveTab("account")}
                  >
                    Account Information
                  </button>
                </li>
              </ul>

              <form onSubmit={handleSubmit} className="p-4">
                {error && <div className="alert alert-danger mb-4">{error}</div>}
                {success && <div className="alert alert-success mb-4">{success}</div>}

                <div className="row g-3">
                  {fieldGroups[activeTab].map((field, index) => (
                    <div className="col-md-6" key={index}>
                      <div className="form-floating position-relative">
                        {field.type === "select" ? (
                          <>
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="form-select ps-4"
                              required
                            >
                              {field.options.map(option => (
                                <option key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                              ))}
                            </select>
                            <label className="ps-4">{field.label}</label>
                            <span className="position-absolute" style={{ top: "16px", left: "12px" }}>
                              {field.icon}
                            </span>
                          </>
                        ) : (
                          <>
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="form-control ps-4"
                              required
                              step={field.type === "number" ? "0.01" : undefined}
                              min={field.type === "number" ? "0" : undefined}
                            />
                            <label className="ps-4">{field.label}</label>
                            <span className="position-absolute" style={{ top: "16px", left: "12px" }}>
                              {field.icon}
                            </span>
                            {field.extra && field.extra}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between mt-4">
                  {activeTab !== "personal" && (
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={() => setActiveTab(activeTab === "account" ? "employment" : "personal")}
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeTab !== "account" ? (
                    <button 
                      type="button" 
                      className="btn btn-primary ms-auto"
                      onClick={() => setActiveTab(activeTab === "personal" ? "employment" : "account")}
                    >
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success ms-auto">
                      <FaUserPlus className="me-2" /> Create User
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdd;