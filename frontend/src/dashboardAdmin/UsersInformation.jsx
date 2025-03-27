import React from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
  }).format(amount);
};

const UsersInformation = ({ user }) => {
  if (!user) return <div className="text-center p-4">No user data available.</div>;

  // Combine current employment with history for unified display
  // In your allEmploymentRecords construction, use effective_date from history
const allEmploymentRecords = [
  {
    isCurrent: true,
    special_order_no: user.special_order_no,
    status_of_employment: user.status_of_employment,
    effective_date: user.effective_date,
    salary: user.salary,
    position: user.position,
    nature_of_appointment: user.nature_of_appointment,
    school_assignment: user.school_assignment,
    date_changed: user.effective_date // This is okay for current record
  },
  ...(user.employment_history || []).map(history => ({
    ...history,
    effective_date: history.effective_date || history.date_changed // Fallback to date_changed if effective_date missing
  }))
].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));


  return (
    <div className="container mt-4 border border-dark p-4">
      <div className="text-center mb-4">
        <p className="fw-bold">Department of Education</p>
        <p className="fw-bold">Schools Division of Baybay City</p>
      </div>
      <div className="text-center mb-4">
        <p className="fw-bold fs-4">TEACHER'S RECORD CARD</p>
      </div>

      {/* Personal Information Section */}
      <div className="table table-bordered mb-4 border border-dark">
        <div className="row">
          <div className="col-2 fw-bold border border-dark">Name:</div>
          <div className="col-3 text-center fw-bold border border-dark">{user.lastName || "N/A"}</div>
          <div className="col-3 text-center fw-bold border border-dark">{user.fullName || "N/A"}</div>
          <div className="col-4 text-center fw-bold border border-dark">{user.middleName || "N/A"}</div>
        </div>
        <div className="row">
          <div className="col-2 border border-dark"></div>
          <div className="col-3 text-center border border-dark">Last Name</div>
          <div className="col-3 text-center border border-dark">First Name</div>
          <div className="col-4 text-center border border-dark">Middle Name</div>
        </div>
      </div>

      <div className="table table-bordered mb-4 border border-dark">
        <div className="row">
          <div className="col-2 fw-bold border border-dark">Place of Birth:</div>
          <div className="col-4 text-center fw-bold border border-dark">{user.place_of_birth || "N/A"}</div>
          <div className="col-2 fw-bold border border-dark">Date of Birth:</div>
          <div className="col-4 text-center fw-bold border border-dark">{formatDate(user.date_of_birth)}</div>
        </div>
        <div className="row">
          <div className="col-6 border border-dark"></div>
          <div className="col-6 text-center border border-dark">(Month/Day/Year)</div>
        </div>
      </div>

      <div className="table table-bordered mb-4 border border-dark">
        <div className="row">
          <div className="col-2 fw-bold border border-dark">Permanent Address:</div>
          <div className="col-10 text-center fw-bold border border-dark">{user.permanent_address || "N/A"}</div>
        </div>
      </div>

      {/* Unified Employment Records Table */}
      <div className="table table-bordered mt-4 border border-dark text-center">
        <div className="row fw-bold border border-dark">
          <div className="col border border-dark">Special Order No.</div>
          <div className="col border border-dark">Status</div>
          <div className="col border border-dark">Effective Date</div>
          <div className="col border border-dark">Salary</div>
          <div className="col border border-dark">Position</div>
          <div className="col border border-dark">Nature</div>
          <div className="col border border-dark">School</div>
        </div>

        {allEmploymentRecords.map((record, index) => (
          <div 
            className={`row border border-dark ${record.isCurrent ? 'bg-light' : ''}`} 
            key={index}
          >
            <div className="col border border-dark">{record.special_order_no || "N/A"}</div>
            <div className="col border border-dark">{record.status_of_employment || "N/A"}</div>
            <div className="col border border-dark">{formatDate(record.effective_date)}</div>
            <div className="col border border-dark">{formatCurrency(record.salary)}</div>
            <div className="col border border-dark">{record.position || "N/A"}</div>
            <div className="col border border-dark">{record.nature_of_appointment || "N/A"}</div>
            <div className="col border border-dark">{record.school_assignment || "N/A"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersInformation;