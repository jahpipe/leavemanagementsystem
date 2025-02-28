import React, { useState, useEffect } from "react";

const ApplyForLeave = () => {
  const [formData, setFormData] = useState({
    leaveTypes: [],
    leaveDetails: "",
    workingDays: "",
    inclusiveDates: "",
    commutation: "",
    applicantSignature: "",
  });

  const [userId, setUserId] = useState(null); // State to store the logged-in user's ID

  // Fetch the logged-in user's ID (example: from localStorage or context)
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user")); // Assuming user data is stored in localStorage
    if (loggedInUser && loggedInUser.id) {
      setUserId(loggedInUser.id);
    }
  }, []);

  const leaveOptions = [
    "Vacation Leave",
    "Mandatory/Forced Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Special Privilege Leave",
    "Solo Parent Leave",
    "Study Leave",
    "10-Day VAWC Leave",
    "Rehabilitation Privilege",
    "Special Leave Benefits for Women",
    "Special Emergency Leave",
    "Adoption Leave",
  ];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      leaveTypes: checked
        ? [...prev.leaveTypes, value]
        : prev.leaveTypes.filter((type) => type !== value),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in. Please log in to submit a leave application.");
      return;
    }

    const [inclusiveDatesStart, inclusiveDatesEnd] = formData.inclusiveDates.split(" to ");

    const leaveData = {
      userId, // Use the logged-in user's ID
      leaveTypes: formData.leaveTypes,
      leaveDetails: formData.leaveDetails,
      workingDays: formData.workingDays,
      inclusiveDatesStart,
      inclusiveDatesEnd,
      commutation: formData.commutation,
      applicantSignature: formData.applicantSignature,
    };

    try {
      const response = await fetch("http://localhost:8000/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveData),
      });

      if (response.ok) {
        alert("Leave application submitted successfully!");
        setFormData({
          leaveTypes: [],
          leaveDetails: "",
          workingDays: "",
          inclusiveDates: "",
          commutation: "",
          applicantSignature: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to submit leave application: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      alert("An error occurred while submitting the application.");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h4 className="text-center mb-4 fw-bold">Application for Leave</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">6.A TYPE OF LEAVE TO BE AVAILED OF</label>
          <div className="row row-cols-1 row-cols-md-4 g-1">
            {leaveOptions.map((option, index) => (
              <div key={index} className="col">
                <div className="form-check" style={{ fontSize: "0.7rem" }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={option}
                    onChange={handleCheckboxChange}
                    checked={formData.leaveTypes.includes(option)}
                  />
                  <label className="form-check-label fw-bold">{option}</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">6.B DETAILS OF LEAVE</label>
            <input
              type="text"
              className="form-control"
              placeholder="Specify details"
              name="leaveDetails"
              value={formData.leaveDetails}
              onChange={handleChange}
              style={{ fontSize: "0.8rem", padding: "5px" }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">6.C WORKING DAYS</label>
            <input
              type="number"
              className="form-control"
              name="workingDays"
              value={formData.workingDays}
              onChange={handleChange}
              required
              style={{ fontSize: "0.8rem", padding: "5px" }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">INCLUSIVE DATES</label>
            <input
              type="date"
              className="form-control"
              name="inclusiveDates"
              value={formData.inclusiveDates}
              onChange={handleChange}
              required
              style={{ fontSize: "0.8rem", padding: "5px" }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">6.D COMMUTATION</label>
          {["Not Requested", "Requested"].map((option, index) => (
            <div key={index} className="form-check" style={{ fontSize: "0.75rem" }}>
              <input
                className="form-check-input"
                type="radio"
                name="commutation"
                value={option}
                checked={formData.commutation === option}
                onChange={handleChange}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary w-100" style={{ fontSize: "0.9rem" }}>
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplyForLeave;