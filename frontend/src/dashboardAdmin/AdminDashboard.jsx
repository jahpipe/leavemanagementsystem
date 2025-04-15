import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiMenu, 
  FiUser, 
  FiClipboard, 
  FiSettings, 
  FiBarChart2, 
  FiDollarSign, 
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiUsers
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import AddUsers from "./Addusers";
import UserView from "./Usersview";
import LeaveRequest from "./LeaveRequest";
import ManageBalance from "./ManageBalance";
import Admin from "./Admin";
import adminAvatar from "../assets/jen.webp";

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

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard": return <Admin />;
      case "addUser": return <AddUsers />;
      case "viewUsers": return <UserView />;
      case "leaves": return <LeaveRequest />;
      case "balance": return <ManageBalance />;
   
      default: return <Admin />;
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <div 
        className={`d-flex flex-column bg-white p-3 border-end ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}
        style={{
          width: isSidebarOpen ? "280px" : "80px",
          transition: "width 0.3s ease",
          boxShadow: "0 0 15px rgba(0,0,0,0.05)"
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
          {isSidebarOpen && (
            <h5 className="mb-0 text-primary fw-bold">
              <FiHome className="me-2" /> Admin Portal
            </h5>
          )}
          <button 
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiMenu size={18} />
          </button>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className={`d-flex align-items-center mb-4 ${isSidebarOpen ? "px-2" : "justify-content-center"}`}>
            <img 
              src={adminAvatar} 
              alt="Admin" 
              className="rounded-circle border border-2 border-primary"
              width="42"
              height="42"
            />
            {isSidebarOpen && (
              <div className="ms-3">
                <p className="mb-0 fw-medium">{currentUser.fullName}</p>
                <small className="text-muted">{currentUser.role}</small>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-grow-1 d-flex flex-column">
          <button
            className={`btn btn-link text-start text-dark d-flex align-items-center mb-2 px-3 py-2 rounded ${activeTab === "dashboard" ? "bg-primary bg-opacity-10 text-primary" : "hover-bg-light"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiBarChart2 className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>

          <div className="mb-2">
            <button
              className={`btn btn-link text-start text-dark d-flex align-items-center w-100 px-3 py-2 rounded ${manageUsersOpen ? "bg-light" : "hover-bg-light"}`}
              onClick={() => setManageUsersOpen(!manageUsersOpen)}
            >
              <FiUsers className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
              {isSidebarOpen && (
                <>
                  <span className="flex-grow-1">Employees</span>
                  {manageUsersOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </>
              )}
            </button>

            {manageUsersOpen && isSidebarOpen && (
              <div className="ps-4 mt-1">
                <button
                  className={`btn btn-link text-dark d-block w-100 text-start mb-1 px-3 py-2 rounded ${activeTab === "addUser" ? "bg-primary bg-opacity-10 text-primary" : "hover-bg-light"}`}
                  onClick={() => setActiveTab("addUser")}
                >
                  Add Employee
                </button>
                <button
                  className={`btn btn-link text-dark d-block w-100 text-start px-3 py-2 rounded ${activeTab === "viewUsers" ? "bg-primary bg-opacity-10 text-primary" : "hover-bg-light"}`}
                  onClick={() => setActiveTab("viewUsers")}
                >
                  View Employees
                </button>
              </div>
            )}
          </div>

          <button
            className={`btn btn-link text-start text-dark d-flex align-items-center mb-2 px-3 py-2 rounded ${activeTab === "leaves" ? "bg-primary bg-opacity-10 text-primary" : "hover-bg-light"}`}
            onClick={() => setActiveTab("leaves")}
          >
            <FiClipboard className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Leave Requests</span>}
          </button>

          <button
            className={`btn btn-link text-start text-dark d-flex align-items-center mb-2 px-3 py-2 rounded ${activeTab === "balance" ? "bg-primary bg-opacity-10 text-primary" : "hover-bg-light"}`}
            onClick={() => setActiveTab("balance")}
          >
            <FiDollarSign className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Balance</span>}
          </button>

          
        </nav>

        {/* Logout */}
        <button 
          className="btn btn-outline-danger d-flex align-items-center mt-auto px-3 py-2 rounded"
          onClick={handleLogout}
        >
          <FiLogOut className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-auto bg-light">
        <div className="container-fluid p-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;