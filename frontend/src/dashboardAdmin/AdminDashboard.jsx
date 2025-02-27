import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiClipboard, FiSettings, FiBarChart, FiLogOut } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import AddUsers from "./Addusers"; // Import AddUsers component
import UserView from "./Usersview";
import LeaveRequest from "./LeaveRequest"; // Import LeaveRequest component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setCurrentUser(userData);
    } else {
      navigate("/LoginForm");
    }
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      navigate("/LoginForm");
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className={`bg-dark text-white d-flex flex-column p-3 ${isSidebarOpen ? "w-250px" : "w-75px"} d-md-flex`}>
        <button className="btn btn-outline-light mb-3 d-md-none" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FiMenu />
        </button>
        <h2 className={`fs-5 text-center ${isSidebarOpen ? "d-block" : "d-none"}`}>Admin Panel</h2>

        {currentUser && (
          <div className="d-flex flex-column align-items-center my-3">
            <p className="text-white mb-0">{currentUser.fullName}</p>
            <p className="text-white small">{currentUser.role}</p>
          </div>
        )}

        <nav className="nav flex-column">
          <button
            className={`btn btn-dark text-start text-white d-flex align-items-center my-2 ${activeTab === "dashboard" ? "bg-primary" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiBarChart className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Dashboard</span>
          </button>

          <button
            className="btn btn-dark text-start text-white d-flex align-items-center my-2"
            onClick={() => setManageUsersOpen(!manageUsersOpen)}
          >
            <FiUser className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Manage Users</span>
          </button>

          {manageUsersOpen && (
            <div className="ms-4">
              <button
                className={`btn btn-dark text-white d-block my-2 ${activeTab === "addUser" ? "bg-primary" : ""}`}
                onClick={() => setActiveTab("addUser")}
              >
                Add User
              </button>
              <button
                className={`btn btn-dark text-white d-block my-2 ${activeTab === "viewUsers" ? "bg-primary" : ""}`}
                onClick={() => setActiveTab("viewUsers")}
              >
                View Users
              </button>
            </div>
          )}

          <button
            className={`btn btn-dark text-start text-white d-flex align-items-center my-2 ${activeTab === "leaves" ? "bg-primary" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            <FiClipboard className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Leave Requests</span>
          </button>

          <button
            className={`btn btn-dark text-start text-white d-flex align-items-center my-2 ${activeTab === "reports" ? "bg-primary" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FiBarChart className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Reports</span>
          </button>

          <button
            className={`btn btn-dark text-start text-white d-flex align-items-center my-2 ${activeTab === "settings" ? "bg-primary" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FiSettings className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Settings</span>
          </button>

          <button className="btn btn-danger text-start text-white d-flex align-items-center mt-auto" onClick={handleLogout}>
            <FiLogOut className="me-2" /> <span className={isSidebarOpen ? "d-inline" : "d-none"}>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light p-4">
        <div className="mt-4">
          {activeTab === "dashboard" && <h3>Welcome to the Admin Dashboard</h3>}
          {activeTab === "users" && <h3>Manage Users Section</h3>}
          {activeTab === "addUser" && <AddUsers />} {/* AddUsers Component Rendered Here */}
          {activeTab === "viewUsers" && <UserView />} {/* View Users Section */}
          {activeTab === "leaves" && <LeaveRequest />} {/* Leave Request Component Rendered Here */}
          {activeTab === "reports" && <h3>Reports & Analytics Section</h3>}
          {activeTab === "settings" && <h3>Settings Section</h3>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
