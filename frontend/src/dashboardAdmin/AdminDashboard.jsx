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
import ProfileEdit from "./ProfileEdit"; // Import ProfileEdit component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false); // State for ProfileEdit modal
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

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser); // Update the current user state
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Save updated user data to localStorage
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
        className={`d-flex flex-column bg-dark text-white p-3 ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}
        style={{
          width: isSidebarOpen ? "280px" : "80px",
          transition: "width 0.3s ease",
          borderTopLeftRadius: "12px",
          borderBottomLeftRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
          {isSidebarOpen && (
            <h5 className="mb-0 text-white fw-bold">
              <FiHome className="me-2" /> Admin Portal
            </h5>
          )}
          <button 
            className="btn btn-sm btn-outline-light p-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiMenu size={18} />
          </button>
        </div>

        {/* User Profile Section */}
        {currentUser && (
          <div className={`d-flex flex-column align-items-center mb-4 ${isSidebarOpen ? "px-2" : "justify-content-center"}`}>
            {currentUser.profileIcon ? (
              <img 
                src={`http://localhost:8000/images/${currentUser.profileIcon}`} 
                alt="Admin" 
                className="rounded-circle border border-3 border-white"
                width="90" // Larger profile image
                height="90"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/path/to/default-image.png"; // Fallback image
                }}
              />
            ) : (
              <FiUser size={90} className="text-white" />
            )}

            {isSidebarOpen && (
              <div className="mt-3 text-center">
                <p className="mb-0 fw-medium text-white">{currentUser.fullName}</p>
                {/* "Admin" text in white color, placed below the name */}
                <p className="mb-0 text-white" style={{ fontSize: "14px", marginTop: "-5px" }}>Admin</p> 
                <button 
                  className="btn btn-link p-0 text-white text-decoration-none"
                  onClick={() => setShowProfileModal(true)} // Open ProfileEdit modal
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-grow-1 d-flex flex-column">
          {/* Dashboard */}
          <button
            className={`btn btn-link text-start text-white d-flex align-items-center mb-3 px-3 py-2 rounded ${activeTab === "dashboard" ? "bg-secondary text-light" : "hover-bg-dark"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiBarChart2 className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>

          {/* Employees Section */}
          <div className="mb-3">
            <button
              className={`btn btn-link text-start text-white d-flex align-items-center w-100 px-3 py-2 rounded ${manageUsersOpen ? "bg-secondary" : "hover-bg-dark"}`}
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
                  className={`btn btn-link text-white d-block w-100 text-start mb-1 px-3 py-2 rounded ${activeTab === "addUser" ? "bg-secondary text-light" : "hover-bg-dark"}`}
                  onClick={() => setActiveTab("addUser")}
                >
                  Add Employee
                </button>
                <button
                  className={`btn btn-link text-white d-block w-100 text-start px-3 py-2 rounded ${activeTab === "viewUsers" ? "bg-secondary text-light" : "hover-bg-dark"}`}
                  onClick={() => setActiveTab("viewUsers")}
                >
                  View Employees
                </button>
              </div>
            )}
          </div>

          {/* Leave Requests */}
          <button
            className={`btn btn-link text-start text-white d-flex align-items-center mb-3 px-3 py-2 rounded ${activeTab === "leaves" ? "bg-secondary text-light" : "hover-bg-dark"}`}
            onClick={() => setActiveTab("leaves")}
          >
            <FiClipboard className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Leave Requests</span>}
          </button>

          {/* Balance Section */}
          <button
            className={`btn btn-link text-start text-white d-flex align-items-center mb-3 px-3 py-2 rounded ${activeTab === "balance" ? "bg-secondary text-light" : "hover-bg-dark"}`}
            onClick={() => setActiveTab("balance")}
          >
            <FiDollarSign className={`${isSidebarOpen ? "me-3" : "mx-auto"}`} size={18} />
            {isSidebarOpen && <span>Balance</span>}
          </button>
        </nav>

        {/* Logout */}
        <button 
          className="btn btn-outline-light d-flex align-items-center mt-auto px-3 py-2 rounded"
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

      {/* Profile Edit Modal */}
      {currentUser && (
        <ProfileEdit 
          user={currentUser} 
          onUpdate={handleProfileUpdate} 
          show={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
