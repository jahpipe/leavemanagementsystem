import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaHome, FaPaperPlane, FaList, FaBalanceScale, FaCog, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import ApplyForLeave from "./ApplyForLeave";
import MyleaveRequest from "./MyleaveRequest";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/LoginForm");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex">
      {/* Sidebar */}
      <div className={`bg-primary text-white p-3 d-flex flex-column shadow vh-100 ${sidebarOpen ? "w-25" : "w-0 d-none d-md-flex"}`} style={{ transition: "width 0.3s" }}>
        <button className="btn btn-light d-md-none mb-3" onClick={() => setSidebarOpen(false)}>
          <FaTimes /> Close
        </button>
        <h3 className="text-center mb-4">Dashboard</h3>
        {user && <p className="text-center">Welcome, {user.fullName}!</p>}

        {[ 
          { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
          { key: "apply", label: "Apply for Leave", icon: <FaPaperPlane /> },
          { key: "requests", label: "My Leave Requests", icon: <FaList /> },
          { key: "balance", label: "Leave Balance", icon: <FaBalanceScale /> },
          { key: "settings", label: "Settings", icon: <FaCog /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? "btn-light text-primary" : "btn-outline-light"} mb-2 d-flex align-items-center gap-2 w-100`}
            onClick={() => {
              setActiveTab(tab.key);
              setSidebarOpen(false);
            }}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}

        <button className="btn btn-danger mt-auto d-flex align-items-center gap-2 w-100" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>

      {/* Sidebar Toggle Button */}
      <button className="btn btn-primary position-fixed top-0 start-0 m-2 d-md-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light ms-md-3">
        {activeTab === "dashboard" && user && (
          <div className="p-4 rounded mb-3 shadow-lg bg-white">
            <h4 className="text-center mb-3">Summary</h4>
            <div className="d-flex justify-content-around">
              <div className="p-3 bg-primary text-white rounded text-center shadow">
                <h5>Leave Balance</h5>
                <p className="fs-4">8 Days</p>
              </div>
              <div className="p-3 bg-warning text-dark rounded text-center shadow">
                <h5>Pending Requests</h5>
                <p className="fs-4">2</p>
              </div>
              <div className="p-3 bg-success text-white rounded text-center shadow">
                <h5>Approved Leaves</h5>
                <p className="fs-4">3</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apply" && <ApplyForLeave />} 

        {activeTab === "requests" && <MyleaveRequest/>}

        {activeTab === "balance" && (
          <div>
            <h2>Leave Balance</h2>
            <p>Vacation Leave: 5 days</p>
            <p>Sick Leave: 3 days</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2>Settings</h2>
            <button className="btn btn-secondary me-2 mt-3">Update Profile</button>
            <button className="btn btn-danger mt-3">Change Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
