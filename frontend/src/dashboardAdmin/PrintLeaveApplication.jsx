import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const PrintLeaveApplication = ({ leaveRequest }) => {
  if (!leaveRequest) {
    return <div>No leave request data available.</div>;
  }

  // List of all leave types
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
    "Others: _________________________",
  ];

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
    <p className="small">DepEd - Baybay City Division</p>
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
        <p>
          <input type="checkbox" className="mr-2" /> In case of Vacation/Special Privilege Leave:
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Within the Philippines
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Abroad (Specify):{" "}
          <span className="underline">_________________________</span>
        </p>
        <p>
          <input type="checkbox" className="mr-2" /> In case of Sick Leave:
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> In Hospital (Specify Illness):{" "}
          <span className="underline">_________________________</span>
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Out Patient (Specify Illness):{" "}
          <span className="underline">_________________________</span>
        </p>
        <p>
          <input type="checkbox" className="mr-2" /> In case of Special Leave Benefits for Women:
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Specify (Illness):{" "}
          <span className="underline">_________________________</span>
        </p>
        <p>
          <input type="checkbox" className="mr-2" /> Others:
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Monetization of Leave Credits
        </p>
        <p className="ml-4">
          <input type="checkbox" className="mr-2" /> Terminal Leave
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
        <input type="checkbox" className="mr-2" /> Not Requested{" "}
        <input type="checkbox" className="mr-2" /> Requested
        <br />
        <br />
        
        <p className="small">_________________________________________________________________</p>
        <p className="small text-center">(Signature of Applicant)</p>
      </p>
    </div>
  </div>
        
  <div className="d-flex">

  </div>

  {/* Signature Section - Properly Centered */}

</div>


        {/* Section 4: Certification of Leave Credits and Recommendation */}
          <div className="border-bottom border-secondary py-2">
         <p className="small font-weight-bold text-center">7. DETAILS OF ACTION ON APPLICATION</p>
            <hr />
          <hr />
          <div className="row mt-2">
            <div className="col-md-6 pr-2">
              <p className="small font-weight-bold">7A. CERTIFICATION OF LEAVE CREDITS</p>
              <div className="row">
                  <p className="col small text-center">As of _________________________</p>
                </div>
              <div className="">   
                <div className=" ">
                <div className="">
                  <table className="table-auto w-full border-collapse border border-black">
                    <tbody>
                      <tr className="border border-black">
                        <td className="border border-black p-2 text-sm">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                        <td className="border border-black p-2 text-sm">Vacation Leave</td>
                        <td className="border border-black p-2 text-sm">Sick Leave</td>
                      </tr>
                      <tr className="border border-black">
                        <td className="border border-black p-2 text-sm" colSpan="3">Total Earned</td>
                      </tr>
                      <tr className="border border-black">
                    
                      </tr>
                      <tr className="border border-black">
                        <td className="border border-black p-2 text-sm" colSpan="3">Less this application</td>
                      </tr>
                      <tr className="border border-black">
                  
                      </tr>
                      <tr className="border border-black">
                        <td className="border border-black p-2 text-sm" colSpan="3">Balance</td>
                      </tr>
                      <tr className="border border-black">
                        
                      </tr>
                    </tbody>
                  </table>
                  </div>
                  </div>
                 </div>
                    <p className="small mt-2">_________________________</p>
                    <p className="small">(JULIUS CESAR L. DE LA CERNA)</p>
                    <p className="small">AO IV / HRMO</p>
                  </div>
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
              <p className="small mt-2">_________________________</p>
              <p className="small">(JOSEMLIO P. RUIZ EdD, CESE)</p>
              <p className="small">Assistant Schools Division Superintendent</p>
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
              <p className="small">_________________________</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="small">_________________________</p>
            <p className="small">(MANUEL P. ALBAÑO PHD, CESO V)</p>
            <p className="small">Schools Division Superintendent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLeaveApplication;