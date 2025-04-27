import "bootstrap/dist/css/bootstrap.min.css";

const PrintLeaveApplication = ({ leaveRequest }) => {
  if (!leaveRequest) {
    return <div>No leave request data available.</div>;
  }

  // Parse the leave_details JSON string with proper error handling
  let leaveDetails = {};
  try {
    leaveDetails = leaveRequest.leave_details ? JSON.parse(leaveRequest.leave_details) : {};
  } catch (error) {
    console.error("Error parsing leave_details:", error);
    leaveDetails = {};
  }

  // Extract fields from leaveDetails with proper fallbacks
  const {
    location = "",
    abroadDetails: abroad_details = "",
    illnessDetails: illness_details = "",
    studyLeave: study_leave = "",
    monetization = "",
    school_assignment = leaveRequest.school_assignment || "N/A" // Fallback to leaveRequest.school_assignment if not in leaveDetails
  } = leaveDetails;

  // List of all leave types
  // Update just the leaveTypes array and checkbox rendering:
const leaveTypes = [
  "Vacation Leave (Sec. 51, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "Mandatory/Forced Leave (Sec. 25, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "Sick Leave (Sec. 43, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "Maternity Leave (R.A. No. 11210 / IRR issued by CSC, DOLE and SSS)",
  "Paternity Leave (R.A. No. 8187 / CSC MC No. 71, s. 1998)",
  "Special Privilege Leave (Sec. 21, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "Solo Parent Leave (R.A. No. 8972)",
  "Study Leave (Sec. 68, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "10-day VAWC Leave (R.A. No. 9262)",
  "Rehabilitation Privilege (Sec. 55, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
  "Special Leave Benefits for Women (R.A. No. 9710)",
  "Special Emergency (Calamity) Leave (CSC MC No. 2, s. 2012, as amended)",
  "Adoption Leave (R.A. No. 8552)",
  // Modified this line to show custom text if available
  leaveRequest.other_leave_type 
    ? `Others: ${leaveRequest.other_leave_type}`
    : "Others: _________________________",
];

// Update the checkbox rendering in your 6A section:
{leaveTypes.map((type, index) => (
  <p key={index}>
    <input
      type="checkbox"
      className="mr-2"
      checked={
        // Modified this logic to properly handle "Others"
        type.startsWith("Others") 
          ? leaveRequest.leave_types.includes("Others") || !!leaveRequest.other_leave_type
          : leaveRequest.leave_types.includes(type.split(" (")[0])
      }
      readOnly
    />{" "}
    {type}
  </p>
))}
  
const currentVacationBalance = Number(leaveRequest.vacationLeave?.remaining_credit || 0);
const currentSickBalance = Number(leaveRequest.sickLeave?.remaining_credit || 0);
const daysApplied = Number(leaveRequest.leave_dates.length);


  return (
    <div className="bg-light p-3" style={{ minHeight: "100vh" }}>
      <div
        className="container bg-white p-4 shadow-sm"
        style={{ maxWidth: "100%", overflowX: "auto" }}
      >
        <div className="text-center mb-4">
          <h1 className="h5 font-weight-bold">Republic of the Philippines</h1>
          <h2 className="h6">Department of Education</h2>
          <h2 className="h6">Region VIII (Eastern Visayas)</h2>
          <h2 className="h6">DIVISION OF BAYBAY CITY</h2>
          <h2 className="h6">Diversion Road, Brgy. Gaas, Baybay City, Leyte</h2>
          <h2 className="h6 font-weight-bold mt-2">APPLICATION FOR LEAVE</h2>
        </div>

        {/* Section 1: Agency/School and Name */}
        <div className="border-top border-bottom border-secondary py-2">
          <div className="row">
            <div className="col-md-6">
              <p className="small font-weight-bold">1. AGENCY/SCHOOL</p>
              <p> {leaveRequest.school_assignment}</p> 
            </div>
            <div className="col-md-6">
              <div style={{ display: "flex", alignItems: "center" }}>
                <p className="small font-weight-bold" style={{ minWidth: "80px" }}>2. NAME:</p>
                <div style={{ display: "flex", gap: "40px", fontWeight: "bold" }}>
                  <span>(Last)</span>
                  <span>(First)</span>
                  <span>(Middle)</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "40px", textDecoration: "underline", marginLeft: "80px" }}>
                <span>{leaveRequest.lastName}</span>
                <span>{leaveRequest.fullName}</span>
                <span>{leaveRequest.middleName || "N/A"}</span>
              </div>
            </div>
          </div>
          <hr style={{ border: "1px solid black", marginTop: "10px" }} />

          <div className="d-flex flex-wrap gap-3 mt-2">
            <div className="flex-grow-1">
              <p className="small font-weight-bold">3. DATE OF FILING</p>
              <p className="small">{new Date(leaveRequest.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex-grow-1">
              <p className="small font-weight-bold">4. POSITION</p>
              <p className="small">{leaveRequest.position || "N/A"}</p>
            </div>
            <div className="flex-grow-1">
              <p className="small font-weight-bold">5. SALARY</p>
              <p className="small">{leaveRequest.salary || "N/A"}</p>
            </div>
          </div>
          <hr />
          <h6 className="text-center">6. DETAILS OF APPLICATION</h6>
        </div>

        {/* Section 2: Type of Leave and Details */}
        <div className="border-bottom border-secondary py-2">
          <div className="row">
            <div className="col-md-6 pr-2">
              <p className="small font-weight-bold">6A. TYPE OF LEAVE TO BE AVAILED OF</p>
              <div className="small">
                {leaveTypes.map((type, index) => (
                  <p key={index}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={leaveRequest.leave_types.includes(type.split(" (")[0])}
                      readOnly
                    />{" "}
                    {type}
                  </p>
                ))}
              </div>
            </div>

            <div className="col-md-6 pl-2">
  <p className="small font-weight-bold">6B. DETAILS OF LEAVE</p>
  <div className="small">
    {/* Vacation/Special Privilege Leave */}
    <p>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; In case of Vacation/Special Privilege Leave:
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={location === 'Within the Philippines'}
        readOnly
      /> Within the Philippines
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={location === 'Abroad'}
        readOnly
      /> Abroad (Specify):{" "}
      <span className="underline">
        {abroad_details || "_________________________"}
      </span>
    </p>

    {/* Sick Leave */}
    <p>
      In case of Sick Leave:
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={illness_details === 'In Hospital'}
        readOnly
      /> In Hospital (Specify Illness):{" "}
      <span className="underline">
        {illness_details || "_________________________"}
      </span>
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={illness_details === 'Out Patient'}
        readOnly
      /> Out Patient (Specify Illness):{" "}
      <span className="underline">
        {illness_details || "_________________________"}
      </span>
    </p>

    {/* Study Leave */}
    <p>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In case of Study Leave:
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={study_leave === "Completion of Master's Degree"}
        readOnly
      /> Completion of Master's Degree
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={study_leave === "BAR/Board Examination Review"}
        readOnly
      /> BAR/Board Examination Review
    </p>
    <p className="ml-4">
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; purpose :{" "}
      <span className="underline">
        {study_leave === "Other" ? study_leave : "_________________________"}
      </span>
    </p>
    {/* Monetization and Terminal Leave */}
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={monetization === 'Monetization of Leave Credits'}
        readOnly
      /> Monetization of Leave Credits
    </p>
    <p className="ml-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={monetization === 'Terminal Leave'}
        readOnly
      /> Terminal Leave
    </p>
  </div>
</div>
          </div>
        </div>

        {/* Section 3: Number of Days and Commutation */}
      <div className="border-bottom border-secondary py-2">
        <div className="row">
          <div className="col-md-6">
            <p className="small font-weight-bold">6C. NUMBER OF WORKING DAYS APPLIED FOR</p>
            <p className="small text-center">{leaveRequest.leave_dates.length} DAY(S)</p>
            <hr />
            <p className="small font-weight-bold">INCLUSIVE DATES</p>
            <p className="small text-center">{leaveRequest.leave_dates.join(", ")}</p>
          </div>
          <div className="col-md-6">
  <p className="small font-weight-bold">6D. COMMUTATION</p>
  <p className="small">
    <input 
      type="checkbox" 
      className="mr-2" 
      checked={leaveRequest.commutation === false || leaveRequest.commutation === 0} 
      readOnly 
    /> Not Requested{" "}
    <input 
      type="checkbox" 
      className="mr-2" 
      checked={leaveRequest.commutation === true || leaveRequest.commutation === 1} 
      readOnly 
    /> Requested
    <br />
    <br />
    <p className="small">______________________________________________</p>
    <p className="small text-center">(Signature of Applicant)</p>
  </p>
</div>
        </div>
      </div>
        {/* Section 7: DETAILS OF ACTION ON APPLICATION */}
<div className="border-bottom border-secondary py-2">
  <p className="small font-weight-bold text-center">7. DETAILS OF ACTION ON APPLICATION</p>
  <hr />
  <hr />
  <div className="row mt-2">
    {/* Section 7A: CERTIFICATION OF LEAVE CREDITS */}
    <div className="col-md-6 pr-2">
      <p className="small font-weight-bold">7A. CERTIFICATION OF LEAVE CREDITS</p>
      <div className="row">
        <p className="col small text-center">As of _________________________</p>
      </div>
      <div className="">
        <div className="">
          <table className="table-auto w-full border-collapse border border-black">
            <tbody>
              <tr className="border border-black">
                <td className="border border-black p-2 text-sm">&nbsp;</td>
                <td className="border border-black p-2 text-sm">Vacation Leave</td>
                <td className="border border-black p-2 text-sm">Sick Leave</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-2 text-sm">Total Earned</td>
                <td className="border border-black p-2 text-sm text-center">
                  {leaveRequest.vacationLeave?.remaining_credit?.toFixed(2) || "0.00"}
                </td>
                <td className="border border-black p-2 text-sm text-center">
                  {leaveRequest.sickLeave?.remaining_credit?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-2 text-sm">Less this application</td>
                <td className="border border-black p-2 text-sm text-center">
                  {leaveRequest.leave_types.includes("Vacation Leave") ? 
                    Number(leaveRequest.leave_dates.length).toFixed(2) : "0.00"}
                </td>
                <td className="border border-black p-2 text-sm text-center">
                  {leaveRequest.leave_types.includes("Sick Leave") ? 
                    Number(leaveRequest.leave_dates.length).toFixed(2) : "0.00"}
                </td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-2 text-sm">Balance</td>
                <td className="border border-black p-2 text-sm text-center">
                  {(
                    Number(leaveRequest.vacationLeave?.remaining_credit || 0) -
                    (leaveRequest.leave_types.includes("Vacation Leave") ? 
                      Number(leaveRequest.leave_dates.length) : 0)
                  ).toFixed(2)}
                </td>
                <td className="border border-black p-2 text-sm text-center">
                  {(
                    Number(leaveRequest.sickLeave?.remaining_credit || 0) -
                    (leaveRequest.leave_types.includes("Sick Leave") ? 
                      Number(leaveRequest.leave_dates.length) : 0)
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />
      <p className="small text-center">JULIUS CESAR L. DE LA CERNA</p>
      <hr />
      <p className="small text-center font-bold">AO IV / HRMO</p>
    </div>

    {/* Section 7B: RECOMMENDATION */}
    <div className="col-md-6 pl-2">
      <p className="small font-weight-bold">7B. RECOMMENDATION</p>
      <div className="small">
        <p>
          <input type="checkbox" className="mr-2" /> For approval
        </p>
        <p>
          <input type="checkbox" className="mr-2" /> For disapproval due to:{" "}
          <span className="underline">_________________________</span>
        </p>
      </div>
      <p className="small mt-2">
        ____________________________________________ <br />
        ____________________________________________ <br />
        ____________________________________________ <br />
        ____________________________________________ <br />
        ____________________________________________ <br />
        ____________________________________________
      </p>
      <br />
      <p className="small text-center">JOSEMLIO P. RUIZ EdD, CESE</p>
      <hr />
      <p className="small text-center">Assistant Schools Division Superintendent</p>
    </div>
  </div>
</div>


        {/* Section 5: Approval and Disapproval */}
        <div className="border-bottom border-secondary py-2">
          <div className="row">
            <div className="col-md-6">
              <p className="small font-weight-bold">8. APPROVED FOR:</p>
              <p className="small">__________ days with pay</p>
              <p className="small">__________ days without pay</p>
              <p className="small">__________ others (Specify)</p>
            </div>
            <div className="col-md-6">
              <p className="small font-weight-bold">7D. DISAPPROVED DUE TO:</p>
              <p className="small">__________________________________________________ <br />
              __________________________________________________ <br />
              __________________________________________________ <br />
              __________________________________________________ <br />__________________________________________________ <br /></p>
            </div>
            <br />
            <br />
          </div>
          <div className="mt-2 text-center">
            <p className="small">MANUEL P. ALBAÑO PHD, CESO V</p>
            <p className="small">Schools Division Superintendent</p>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default PrintLeaveApplication;