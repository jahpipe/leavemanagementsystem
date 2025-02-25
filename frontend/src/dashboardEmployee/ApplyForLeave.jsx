import React, { useState } from "react";

const ApplyForLeave = () => {
  const [formData, setFormData] = useState({
    leaveTypes: [],
    leaveDetails: "",
    workingDays: "",
    inclusiveDates: "",
    commutation: "",
    applicantSignature: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Leave application submitted successfully!");
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
                  <input className="form-check-input" type="checkbox" value={option} onChange={handleCheckboxChange} checked={formData.leaveTypes.includes(option)} />
                  <label className="form-check-label fw-bold">{option}</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">6.B DETAILS OF LEAVE</label>
            <input type="text" className="form-control" placeholder="Specify details" name="leaveDetails" value={formData.leaveDetails} onChange={handleChange} style={{ fontSize: "0.8rem", padding: "5px" }} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">6.C WORKING DAYS</label>
            <input type="number" className="form-control" name="workingDays" value={formData.workingDays} onChange={handleChange} required style={{ fontSize: "0.8rem", padding: "5px" }} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">INCLUSIVE DATES</label>
            <input type="date" className="form-control" name="inclusiveDates" value={formData.inclusiveDates} onChange={handleChange} required style={{ fontSize: "0.8rem", padding: "5px" }} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">6.D COMMUTATION</label>
          {[
            "Not Requested",
            "Requested"
          ].map((option, index) => (
            <div key={index} className="form-check" style={{ fontSize: "0.75rem" }}>
              <input className="form-check-input" type="radio" name="commutation" value={option} checked={formData.commutation === option} onChange={handleChange} />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary w-100" style={{ fontSize: "0.9rem" }}>Submit Application</button>
      </form>
    </div>
  );
};

export default ApplyForLeave;
