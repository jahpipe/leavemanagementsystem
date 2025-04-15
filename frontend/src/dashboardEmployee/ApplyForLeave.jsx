import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LEAVE_TYPE_IDS = {
  "Vacation Leave": 1,
  "Mandatory/Forced Leave": 2,
  "Sick Leave": 3,
  "Maternity Leave": 4,
  "Paternity Leave": 5,
  "Special Privilege Leave": 6,
  "Solo Parent Leave": 7,
  "Study Leave": 8,
  "10-Day VAWC Leave": 9,
  "Rehabilitation Privilege": 10,
  "Special Leave Benefits for Women": 11,
  "Special Emergency (Calamity) Leave": 12,
  "Adoption Leave": 13,
  "Other": 14,
};

const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    leaveType: [],
    otherLeaveType: "",
    location: "",
    abroadDetails: "",
    illnessType: "", // Added separate field for illness type
    illnessDetails: "", // Added separate field for illness details
    studyLeave: "",
    monetization: "",
    commutation: "",
    numberOfDays: "",
    inclusiveDatesCommaSeparated: "",
    inclusiveDates: [],
    monetizeLeaveCredits: false,
    terminalLeave: false,
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser?.id) {
      setUserId(loggedInUser.id);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (type === "checkbox") {
        if (name === "leaveType") {
          const updatedLeaveType = checked
            ? [...prev.leaveType, value]
            : prev.leaveType.filter((item) => item !== value);

          // Clear related fields when leave type is unchecked
          let newState = { ...prev, leaveType: updatedLeaveType };
          
          if (!checked) {
            if (value === "Vacation Leave" || value === "Special Privilege Leave") {
              newState.location = "";
              newState.abroadDetails = "";
            }
            if (value === "Sick Leave") {
              newState.illnessType = "";
              newState.illnessDetails = "";
            }
            if (value === "Study Leave") {
              newState.studyLeave = "";
            }
          } else {
            // Set default values when leave type is checked
            if (value === "Sick Leave") {
              newState.illnessType = "In Hospital";
            }
            if (value === "Vacation Leave" || value === "Special Privilege Leave") {
              newState.location = "Within the Philippines";
            }
            if (value === "Study Leave") {
              newState.studyLeave = "Completion of Master's Degree";
            }
          }

          return newState;
        }
        return { ...prev, [name]: checked };
      }

      if (type === "radio") {
        return {
          ...prev,
          [name]: prev[name] === value ? "" : value,
        };
      }

      if (name === "inclusiveDatesCommaSeparated") {
        return {
          ...prev,
          inclusiveDatesCommaSeparated: value,
          inclusiveDates: value.split(",").map((date) => date.trim()).filter((date) => date !== ""),
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.leaveType.length === 0) {
      alert("Please select at least one leave type.");
      return;
    }

    if (formData.leaveType.includes("Other") && !formData.otherLeaveType.trim()) {
      alert("Please specify the 'Other' leave type.");
      return;
    }

    if (formData.inclusiveDates.length === 0) {
      alert("Please enter at least one valid leave date.");
      return;
    }

    if (!userId) {
      alert("User not logged in. Please log in to submit a leave application.");
      return;
    }

    // Validate dependent fields
    if ((formData.leaveType.includes("Vacation Leave") || 
         formData.leaveType.includes("Special Privilege Leave")) && 
        !formData.location) {
      alert("Please specify location for Vacation/Special Privilege Leave.");
      return;
    }

    if (formData.leaveType.includes("Sick Leave") && (!formData.illnessType || !formData.illnessDetails)) {
      alert("Please specify illness details for Sick Leave.");
      return;
    }

    if (formData.leaveType.includes("Study Leave") && !formData.studyLeave) {
      alert("Please specify study leave details.");
      return;
    }

    const leaveTypes = formData.leaveType.map((type) => LEAVE_TYPE_IDS[type]);

    const payload = {
      user_id: userId,
      leave_types: leaveTypes,
      other_leave_type: formData.otherLeaveType || null,
      leave_details: JSON.stringify({
        location: formData.location || null,
        abroadDetails: formData.abroadDetails || null,
        illnessType: formData.illnessType || null,
        illnessDetails: formData.illnessDetails || null,
        studyLeave: formData.studyLeave || null,
      }),
      number_of_days: formData.numberOfDays,
      location: formData.location || null,
      abroad_details: formData.abroadDetails || null,
      illness_type: formData.illnessType || null,
      illness_details: formData.illnessDetails || null,
      study_leave: formData.studyLeave || null,
      monetization: formData.monetization || null,
      commutation: formData.commutation || null,
      status: "Pending",
      leave_dates: formData.inclusiveDates,
      monetize_leave_credits: formData.monetizeLeaveCredits,
      terminal_leave: formData.terminalLeave,
    };

    try {
      const response = await fetch("http://localhost:8000/api/leaverequest/apply-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Leave application submitted successfully!");
        setFormData({
          leaveType: [],
          otherLeaveType: "",
          location: "",
          abroadDetails: "",
          illnessType: "",
          illnessDetails: "",
          studyLeave: "",
          monetization: "",
          commutation: "",
          numberOfDays: "",
          inclusiveDatesCommaSeparated: "",
          inclusiveDates: [],
          monetizeLeaveCredits: false,
          terminalLeave: false,
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to submit leave application: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      alert("An error occurred while submitting the leave application.");
    }
  };

  // Helper function to check if a leave type is selected
  const isLeaveTypeSelected = (type) => formData.leaveType.includes(type);

  return (
    <div className="container py-4" style={{ overflow: "auto", maxHeight: "90vh", boxSizing: "border-box" }}>
      <div className="bg-white p-4 rounded shadow-lg" style={{ boxSizing: "border-box" }}>
        <h2 className="fw-bold mb-4 text-primary text-center border-bottom pb-2">6. DETAILS OF APPLICATION</h2>

        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-3">
            {/* 6.A TYPE OF LEAVE TO BE AVAILED OF */}
            <div className="flex-grow-1 p-3 border rounded bg-light">
              <h3 className="fw-semibold mb-3 text-secondary">6.A TYPE OF LEAVE TO BE AVAILED OF</h3>
              <div className="mb-3">
                {[
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
                  "Special Emergency (Calamity) Leave",
                  "Adoption Leave",
                ].map((leaveType, index) => (
                  <div className="form-check" key={index}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`leave-${index}`}
                      name="leaveType"
                      value={leaveType}
                      onChange={handleChange}
                      checked={formData.leaveType.includes(leaveType)}
                    />
                    <label className="form-check-label" htmlFor={`leave-${index}`}>
                      {leaveType}
                    </label>
                  </div>
                ))}
                <div className="d-flex align-items-center mt-3">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    id="other-leave"
                    name="leaveType"
                    value="Other"
                    onChange={handleChange}
                    checked={formData.leaveType.includes("Other")}
                  />
                  <label className="me-2">Others:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="otherLeaveType"
                    value={formData.otherLeaveType}
                    onChange={handleChange}
                    disabled={!formData.leaveType.includes("Other")}
                  />
                </div>
              </div>
            </div>

            {/* 6.B DETAILS OF LEAVE */}
            <div className="flex-grow-1 p-3 border rounded bg-light">
              <h3 className="fw-semibold mb-3 text-secondary">6.B DETAILS OF LEAVE</h3>

              {/* Vacation/Special Privilege Leave Section */}
              <div className="mb-3">
                <label className="fw-semibold">In case of Vacation/Special Privilege Leave:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="vacation-ph"
                    name="location"
                    value="Within the Philippines"
                    onChange={handleChange}
                    checked={formData.location === "Within the Philippines"}
                    disabled={!isLeaveTypeSelected("Vacation Leave") && !isLeaveTypeSelected("Special Privilege Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Vacation Leave") && !isLeaveTypeSelected("Special Privilege Leave") ? "text-muted" : ""}`} htmlFor="vacation-ph">
                    Within the Philippines
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="vacation-abroad"
                    name="location"
                    value="Abroad"
                    onChange={handleChange}
                    checked={formData.location === "Abroad"}
                    disabled={!isLeaveTypeSelected("Vacation Leave") && !isLeaveTypeSelected("Special Privilege Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Vacation Leave") && !isLeaveTypeSelected("Special Privilege Leave") ? "text-muted" : ""}`} htmlFor="vacation-abroad">
                    Abroad (Specify)
                  </label>
                  {formData.location === "Abroad" && (
                    <input
                      type="text"
                      className="form-control form-control-sm mt-2"
                      name="abroadDetails"
                      value={formData.abroadDetails}
                      onChange={handleChange}
                      placeholder="Specify location abroad"
                      disabled={!isLeaveTypeSelected("Vacation Leave") && !isLeaveTypeSelected("Special Privilege Leave")}
                    />
                  )}
                </div>
              </div>

              {/* Sick Leave Section - UPDATED */}
              <div className="mb-3">
                <label className="fw-semibold">In case of Sick Leave:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="sick-hospital"
                    name="illnessType"
                    value="In Hospital"
                    onChange={handleChange}
                    checked={formData.illnessType === "In Hospital"}
                    disabled={!isLeaveTypeSelected("Sick Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Sick Leave") ? "text-muted" : ""}`} htmlFor="sick-hospital">
                    In Hospital (Specify Illness)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="sick-outpatient"
                    name="illnessType"
                    value="Out Patient"
                    onChange={handleChange}
                    checked={formData.illnessType === "Out Patient"}
                    disabled={!isLeaveTypeSelected("Sick Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Sick Leave") ? "text-muted" : ""}`} htmlFor="sick-outpatient">
                    Out Patient (Specify Illness)
                  </label>
                </div>
                {(formData.illnessType === "In Hospital" || formData.illnessType === "Out Patient") && (
                  <input
                    type="text"
                    className="form-control form-control-sm mt-2"
                    name="illnessDetails"
                    value={formData.illnessDetails}
                    onChange={handleChange}
                    placeholder="Specify illness details"
                    disabled={!isLeaveTypeSelected("Sick Leave")}
                  />
                )}
              </div>

              {/* Study Leave Section */}
              <div className="mb-3">
                <label className="fw-semibold">In case of Study Leave:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="studyLeave"
                    id="masters-degree"
                    value="Completion of Master's Degree"
                    onChange={handleChange}
                    checked={formData.studyLeave === "Completion of Master's Degree"}
                    disabled={!isLeaveTypeSelected("Study Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Study Leave") ? "text-muted" : ""}`} htmlFor="masters-degree">
                    Completion of Master's Degree
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="studyLeave"
                    id="bar-exam"
                    value="BAR/Board Examination Review"
                    onChange={handleChange}
                    checked={formData.studyLeave === "BAR/Board Examination Review"}
                    disabled={!isLeaveTypeSelected("Study Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Study Leave") ? "text-muted" : ""}`} htmlFor="bar-exam">
                    BAR/Board Examination Review
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="studyLeave"
                    id="other-purpose"
                    value="Other purpose"
                    onChange={handleChange}
                    checked={formData.studyLeave === "Other purpose"}
                    disabled={!isLeaveTypeSelected("Study Leave")}
                  />
                  <label className={`form-check-label ${!isLeaveTypeSelected("Study Leave") ? "text-muted" : ""}`} htmlFor="other-purpose">
                    Other purpose
                  </label>
                </div>
                {formData.studyLeave === "Other purpose" && (
                  <input
                    type="text"
                    className="form-control form-control-sm mt-2"
                    name="studyLeave"
                    value={formData.studyLeave}
                    onChange={handleChange}
                    placeholder="Specify purpose"
                    disabled={!isLeaveTypeSelected("Study Leave")}
                  />
                )}
              </div>

              {/* Monetization of Leave Credits */}
              <div className="mb-3">
                <label className="fw-semibold">Monetization of Leave Credits:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="monetize-leave-credits"
                    name="monetizeLeaveCredits"
                    onChange={handleChange}
                    checked={formData.monetizeLeaveCredits}
                  />
                  <label className="form-check-label" htmlFor="monetize-leave-credits">
                    Monetize Leave Credits
                  </label>
                </div>
              </div>

              {/* Terminal Leave */}
              <div className="mb-3">
                <label className="fw-semibold">Terminal Leave:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terminal-leave"
                    name="terminalLeave"
                    onChange={handleChange}
                    checked={formData.terminalLeave}
                  />
                  <label className="form-check-label" htmlFor="terminal-leave">
                    Terminal Leave
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            {/* 6.C NUMBER OF WORKING DAYS APPLIED FOR */}
            <div className="flex-grow-1 p-3 border rounded bg-light">
              <h3 className="fw-semibold mb-3 text-secondary">6.C NUMBER OF WORKING DAYS APPLIED FOR</h3>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Number of Working Days"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="fw-semibold">Inclusive Dates (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MM/DD/YYYY, MM/DD/YYYY"
                  name="inclusiveDatesCommaSeparated"
                  value={formData.inclusiveDatesCommaSeparated}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 6.D COMMUTATION */}
            <div className="flex-grow-1 p-3 border rounded bg-light">
              <h3 className="fw-semibold mb-3 text-secondary">6.D COMMUTATION</h3>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="commutation"
                    id="commutation-not-requested"
                    value="Not requested"
                    onChange={handleChange}
                    checked={formData.commutation === "Not requested"}
                  />
                  <label className="form-check-label" htmlFor="commutation-not-requested">
                    Not requested
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="commutation"
                    id="commutation-requested"
                    value="Requested"
                    onChange={handleChange}
                    checked={formData.commutation === "Requested"}
                  />
                  <label className="form-check-label" htmlFor="commutation-requested">
                    Requested
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;