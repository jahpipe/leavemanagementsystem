import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaHome, FaPaperPlane, FaList, FaBalanceScale, 
  FaCog, FaSignOutAlt, FaBars, FaTimes, 
  FaBell, FaCalendarAlt, FaUserCircle, FaChartLine
} from "react-icons/fa";
import { MdPendingActions, MdApproval, MdSick } from "react-icons/md";
import { BsCalendarCheck, BsCalendarX } from "react-icons/bs";
import ApplyForLeave from "./ApplyForLeave";
import MyleaveRequest from "./MyleaveRequest";
import LeaveCredit from "./LeaveCredit";
import ProfileEdit from "./ProfileEdit";

const EmployeeDashboard = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [leaveData, setLeaveData] = useState({
    balance: {
      total: 0,
      sick: 0,
      vacation: 0,
      emergency: 0
    },
    pending: 0,
    approved: 0,
    upcoming: [],
    recent: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser); // Update the user state
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Save to localStorage
  };

  const fetchLeaveData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const baseUrl = 'http://localhost:8000';
      
      const balanceResponse = await fetch(`${baseUrl}/api/empdashboard/leave-balances/${user.id}`);
      if (!balanceResponse.ok) throw new Error(`Failed to fetch leave balances: ${balanceResponse.statusText}`);
      const balanceData = await balanceResponse.json();

      const upcomingResponse = await fetch(`${baseUrl}/api/empdashboard/upcoming-leaves/${user.id}`);
      if (!upcomingResponse.ok) throw new Error(`Failed to fetch upcoming leaves: ${upcomingResponse.statusText}`);
      const upcomingData = await upcomingResponse.json();

      const formattedData = {
        balance: balanceData.balance || {
          total: 0,
          sick: 0,
          vacation: 0,
          emergency: 0
        },
        upcoming: upcomingData.map(leave => ({
          id: leave.id,
          type: leave.leave_type,
          date: leave.leave_date,
          status: leave.status.toLowerCase(),
          duration: leave.duration || 1
        })),
        pending: upcomingData.filter(leave => leave.status === 'Pending').length,
        approved: upcomingData.filter(leave => leave.status === 'Approved').length
      };

      setLeaveData(formattedData);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setLeaveData({
        balance: { total: 0, sick: 0, vacation: 0, emergency: 0 },
        pending: 0,
        approved: 0,
        upcoming: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [user?.id]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        setNotifications([
          { id: 1, text: "Your leave request has been approved", time: "2 hours ago", read: false },
          { id: 2, text: "New policy update", time: "1 day ago", read: true }
        ]);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
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

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const getLeaveIcon = (type) => {
    switch(type) {
      case 'Sick': return <MdSick className="text-info me-2" />;
      case 'Vacation': return <BsCalendarCheck className="text-success me-2" />;
      case 'Emergency': return <BsCalendarX className="text-danger me-2" />;
      default: return <FaCalendarAlt className="text-primary me-2" />;
    }
  };

  // Add loading state for user data
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      {/* Mobile Header */}
      <header className="d-md-none bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <button 
          className="btn btn-link text-white p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars size={20} />
        </button>
        <h5 className="mb-0">Employee Dashboard</h5>
        <div className="position-relative">
          <FaBell size={20} />
          {notifications.some(n => !n.read) && (
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          )}
        </div>
      </header>

      <div className="row g-0">
        {/* Sidebar */}
        <div className={`col-md-3 col-lg-2 bg-dark text-white ${sidebarOpen ? "d-block" : "d-none d-md-block"}`} 
             style={{ minHeight: "100vh" }}>
          <div className="d-flex flex-column h-100 p-3">
            <div className="text-center mb-4 pt-3 position-relative">
              <button 
                className="btn btn-link text-white d-md-none p-0 position-absolute top-0 end-0 me-3"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes size={20} />
              </button>
              <div className="d-flex flex-column align-items-center">
              {user?.profileIcon ? (
  <img 
    src={`http://localhost:8000/images/${user.profileIcon}`} 
    alt="Profile" 
    className="rounded-circle mb-3"
    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/path/to/default-image.png'; // Fallback image
    }}
  />
) : (
  <FaUserCircle size={60} className="mb-3 text-white" />
)}
  <div className="text-center">
    <h5 className="mb-1 text-white">{user.fullName || 'User'}</h5>
    <small className="text-white-50">{user.position || "Employee"}</small>
  </div>
</div>
            </div>

            <hr className="bg-secondary" />

            <nav className="nav flex-column mb-auto">
              {[
                { id: "dashboard", label: "Dashboard", icon: <FaHome className="me-2" /> },
                { id: "apply", label: "Apply for Leave", icon: <FaPaperPlane className="me-2" /> },
                { id: "requests", label: "My Requests", icon: <FaList className="me-2" /> },
                { id: "balance", label: "Leave Balance", icon: <FaBalanceScale className="me-2" /> },
              
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-link text-start text-white text-decoration-none py-2 px-3 mb-1 rounded ${activeTab === tab.id ? "bg-primary" : "hover-bg-gray-800"}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <hr className="bg-secondary" />

            <button 
              className="btn btn-link text-white text-decoration-none py-2 px-3 rounded text-start hover-bg-gray-800"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <main className="p-3 p-md-4">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row mb-4">
                      <div className="col-12">
                        <h2 className="mb-1">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h2>
                        <p className="text-muted">Here's your leave summary for {new Date().getFullYear()}</p>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="row g-3 mb-4">
                      {[
                        { 
                          id: "total",
                          title: "Total Leave Balance", 
                          value: `${Number(leaveData.balance.total).toFixed(1)}`, 
                          subtitle: "Days available", 
                          icon: <FaBalanceScale size={24} />,
                          color: "primary",
                          trend: "up"
                        },
                        { 
                          id: "sick",
                          title: "Sick Leave", 
                          value: `${Number(leaveData.balance.sick).toFixed(1)}`, 
                          subtitle: "Days remaining", 
                          icon: <MdSick size={24} />,
                          color: "info",
                          trend: "neutral"
                        },
                        { 
                          id: "vacation",
                          title: "Vacation Leave", 
                          value: `${Number(leaveData.balance.vacation).toFixed(1)}`, 
                          subtitle: "Days remaining", 
                          icon: <BsCalendarCheck size={24} />,
                          color: "success",
                          trend: "down"
                        },
                        { 
                          id: "pending",
                          title: "Pending Approval", 
                          value: leaveData.pending || 0, 
                          subtitle: "Requests", 
                          icon: <MdPendingActions size={24} />,
                          color: "warning",
                          trend: "up"
                        }
                      ].map((stat) => (
                        <div key={stat.id} className="col-md-6 col-xl-3">
                          <div className={`card border-5 border-start border-${stat.color} h-100 shadow-sm`}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 className="text-muted mb-2">{stat.title}</h6>
                                  <h2 className={`text-${stat.color} mb-0`}>{stat.value}</h2>
                                  <small className="text-muted">{stat.subtitle}</small>
                                </div>
                                <div className={`bg-${stat.color}-subtle text-${stat.color} rounded p-2 align-self-start`}>
                                  {stat.icon}
                                </div>
                              </div>
                              <div className="mt-3 d-flex align-items-center">
                                <span className={`badge bg-${stat.color}-subtle text-${stat.color} me-2`}>
                                  {stat.trend === "up" ? "↑ Increased" : stat.trend === "down" ? "↓ Decreased" : "→ Stable"}
                                </span>
                                <small className="text-muted">vs last month</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Two Column Layout */}
                    <div className="row g-3">
                      {/* Upcoming Leaves */}
                      <div className="col-lg-7">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Upcoming Leaves</h5>
                            <div>
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => setActiveTab("apply")}
                              >
                                + New Request
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setActiveTab("requests")}
                              >
                                View All
                              </button>
                            </div>
                          </div>
                          <div className="card-body p-0">
                            {leaveData.upcoming.length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="bg-light">
                                    <tr>
                                      <th>Leave Type</th>
                                      <th>Date</th>
                                      <th>Duration</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {leaveData.upcoming.slice(0, 5).map((leave) => (
                                      <tr key={leave.id}>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            {getLeaveIcon(leave.type)}
                                            {leave.type}
                                          </div>
                                        </td>
                                        <td>
                                          {new Date(leave.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </td>
                                        <td>{leave.duration} day{leave.duration > 1 ? 's' : ''}</td>
                                        <td>
                                          <span className={`badge bg-${leave.status === 'approved' ? 'success' : 'warning'}-subtle text-${leave.status === 'approved' ? 'success' : 'warning'}`}>
                                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-5">
                                <FaCalendarAlt size={32} className="text-muted mb-3" />
                                <h5 className="text-muted">No upcoming leaves</h5>
                                <p className="text-muted mb-4">You don't have any scheduled leaves</p>
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => setActiveTab("apply")}
                                >
                                  Apply for Leave
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="col-lg-5">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-header bg-white">
                            <h5 className="mb-0">Leave Summary</h5>
                          </div>
                          <div className="card-body">
                            <div className="mb-4">
                              <h6 className="text-muted mb-3">Leave Distribution</h6>
                              <div className="d-flex flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-success me-2" style={{ width: "12px", height: "12px" }}></span>
                                  <small>Vacation: {leaveData.balance.vacation} days</small>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-info me-2" style={{ width: "12px", height: "12px" }}></span>
                                  <small>Sick: {leaveData.balance.sick} days</small>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-muted mb-3">Quick Actions</h6>
                              <div className="row g-2">
                                <div className="col-6">
                                  <button 
                                    className="btn btn-outline-primary w-100 py-2 d-flex flex-column align-items-center"
                                    onClick={() => setActiveTab("apply")}
                                  >
                                    <FaPaperPlane className="mb-1" />
                                    <small>Apply Leave</small>
                                  </button>
                                </div>
                                <div className="col-6">
                                  <button 
                                    className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center"
                                    onClick={() => setActiveTab("balance")}
                                  >
                                    <FaChartLine className="mb-1" />
                                    <small>View Stats</small>
                                  </button>
                                </div>
                                <div className="col-6">
                                  <button 
                                    className="btn btn-outline-info w-100 py-2 d-flex flex-column align-items-center"
                                    onClick={() => setActiveTab("requests")}
                                  >
                                    <FaList className="mb-1" />
                                    <small>My Requests</small>
                                  </button>
                                </div>
                                <div className="col-6">
                                  <button 
                                    className="btn btn-outline-secondary w-100 py-2 d-flex flex-column align-items-center"
                                    onClick={() => setShowProfileModal(true)}
                                  >
                                    <FaCog className="mb-1" />
                                    <small>Settings</small>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Other Tabs */}
            {activeTab === "apply" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h4 className="mb-0">Apply for Leave</h4>
                </div>
                <div className="card-body">
                  <ApplyForLeave user={user} onApplySuccess={fetchLeaveData} />
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h4 className="mb-0">My Leave Requests</h4>
                </div>
                <div className="card-body">
                  <MyleaveRequest user={user} onStatusChange={fetchLeaveData} />
                </div>
              </div>
            )}

            {activeTab === "balance" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h4 className="mb-0">Leave Balance</h4>
                </div>
                <div className="card-body">
                  <LeaveCredit user={user} leaveData={leaveData} isLoading={isLoading} />
                </div>
              </div>
            )}
            
            {/* Profile Edit Modal */}
            <ProfileEdit 
              user={user} 
              onUpdate={(updatedUser) => {
                handleProfileUpdate(updatedUser);
                fetchLeaveData(); // Refresh data after update
              }}
              show={showProfileModal}
              onClose={() => setShowProfileModal(false)}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;