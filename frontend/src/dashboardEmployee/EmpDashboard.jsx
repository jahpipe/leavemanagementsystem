import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaHome, FaPaperPlane, FaList, FaBalanceScale, 
  FaCog, FaSignOutAlt, FaBars, FaTimes, 
  FaBell, FaCalendarAlt, FaUserCircle, FaChartPie
} from "react-icons/fa";
import { MdPendingActions, MdApproval } from "react-icons/md";
import ApplyForLeave from "./ApplyForLeave";
import MyleaveRequest from "./MyleaveRequest";
import LeaveCredit from "./LeaveCredit";

const EmployeeDashboard = () => {
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

  // Fetch leave balances and stats
  // Update the fetchLeaveData function in useEffect
useEffect(() => {
  const fetchLeaveData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Update these URLs to match your backend server address
      const baseUrl = 'http://localhost:8000'; // or whatever port your backend uses
      
      // Fetch leave balances
      const balanceResponse = await fetch(`${baseUrl}/api/empdashboard/leave-balances/${user.id}`);
      if (!balanceResponse.ok) {
        throw new Error(`Failed to fetch leave balances: ${balanceResponse.statusText}`);
      }
      const balanceData = await balanceResponse.json();

      // Fetch upcoming leaves
      const upcomingResponse = await fetch(`${baseUrl}/api/empdashboard/upcoming-leaves/${user.id}`);
      if (!upcomingResponse.ok) {
        throw new Error(`Failed to fetch upcoming leaves: ${upcomingResponse.statusText}`);
      }
      const upcomingData = await upcomingResponse.json();

      // Format the data
      const formattedData = {
        balance: balanceData.balance || {
          total: 0,
          sick: 0,
          vacation: 0,
          emergency: 0
        },
        upcoming: upcomingData.map(leave => ({
          type: leave.leave_type,
          date: new Date(leave.leave_date).toLocaleDateString(),
          status: leave.status.toLowerCase()
        })),
        pending: upcomingData.filter(leave => leave.status === 'Pending').length,
        approved: upcomingData.filter(leave => leave.status === 'Approved').length
      };

      setLeaveData(formattedData);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      // Show error state to user
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

  fetchLeaveData();
}, [user?.id]);

  // User authentication check
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      
      // Fetch notifications (you can replace this with actual API call)
      setNotifications([
        { id: 1, text: "Your leave request has been approved", time: "2 hours ago", read: false },
        { id: 2, text: "New policy update", time: "1 day ago", read: true }
      ]);
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

  const statsCards = [
    { 
      title: "Leave Balance", 
      value: `${leaveData.balance.total} Days`, 
      subtitle: `${leaveData.balance.sick} SL | ${leaveData.balance.vacation} VL`, 
      icon: <FaBalanceScale size={24} />,
      color: "primary",
      bg: "primary-subtle"
    },
    { 
      title: "Pending Requests", 
      value: leaveData.pending, 
      subtitle: "Awaiting approval", 
      icon: <MdPendingActions size={24} />,
      color: "warning",
      bg: "warning-subtle"
    },
    { 
      title: "Approved Leaves", 
      value: leaveData.approved, 
      subtitle: "This year", 
      icon: <MdApproval size={24} />,
      color: "success",
      bg: "success-subtle"
    },

  ];
  
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
             style={{ minHeight: "100vh", position: "sticky", top: 0 }}>
          <div className="d-flex flex-column h-100 p-3">
            <div className="text-center mb-4 pt-3">
              <button 
                className="btn btn-link text-white d-md-none p-0 position-absolute top-0 end-0 me-3"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes size={20} />
              </button>
              <div className="d-flex flex-column align-items-center">
                <FaUserCircle size={60} className="mb-3 text-white" />
                {user && (
                  <div className="text-center">
                    <h5 className="mb-1 text-white">{user.fullName}</h5>
                    <small className="text-muted">{user.position || "Employee"}</small>
                  </div>
                )}
              </div>
            </div>

            <hr className="text-muted my-3" />

            <nav className="nav flex-column mb-auto">
              {[
                { key: "dashboard", label: "Dashboard", icon: <FaHome className="me-2" /> },
                { key: "apply", label: "Apply for Leave", icon: <FaPaperPlane className="me-2" /> },
                { key: "requests", label: "My Requests", icon: <FaList className="me-2" /> },
                { key: "balance", label: "Leave Balance", icon: <FaBalanceScale className="me-2" /> },

              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`btn btn-link text-start text-white text-decoration-none py-2 px-3 mb-1 rounded-3 ${activeTab === tab.key ? "bg-primary" : "hover-bg-dark"}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSidebarOpen(false);
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <hr className="text-muted my-3" />

            <button 
              className="btn btn-link text-white text-decoration-none py-2 px-3 rounded-3 text-start hover-bg-dark"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          {/* Desktop Header */}
          <header className="d-none d-md-flex bg-white shadow-sm p-3 justify-content-between align-items-center">
            <h4 className="mb-0 text-capitalize">
              {activeTab === "dashboard" ? "Dashboard Overview" : 
               activeTab === "apply" ? "Apply for Leave" :
               activeTab === "requests" ? "My Leave Requests" :
               activeTab === "balance" ? "Leave Balance" : "Account Settings"}
            </h4>
            
            <div className="d-flex align-items-center">
              <div className="dropdown me-3">
                <button 
                  className="btn btn-light position-relative rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                  data-bs-toggle="dropdown"
                >
                  <FaBell />
                  {notifications.some(n => !n.read) && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                      <span className="visually-hidden">New alerts</span>
                    </span>
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: "300px" }}>
                  <div className="p-3 border-bottom">
                    <h5 className="mb-0">Notifications</h5>
                  </div>
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-bottom ${notification.read ? "" : "bg-light"}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <p className="mb-1">{notification.text}</p>
                          <small className="text-muted">{notification.time}</small>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-muted">No new notifications</div>
                    )}
                  </div>
                </div>
              </div>
              
              {user && (
                <div className="dropdown">
                  <button 
                    className="btn btn-light dropdown-toggle d-flex align-items-center rounded-pill"
                    data-bs-toggle="dropdown"
                  >
                    <span className="me-2 d-none d-lg-inline">{user.fullName.split(' ')[0]}</span>
                    <FaUserCircle size={24} />
                  </button>
                  
                </div>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-4">
  {/* Dashboard Tab */}
  {activeTab === "dashboard" && user && (
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
              <h2 className="mb-1">Welcome back, {user.fullName.split(' ')[0]}!</h2>
              <p className="text-muted">Here's your leave management summary</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            {[
              { 
                title: "Leave Balance", 
                value: `${Number(leaveData.balance.total).toFixed(1)} Days`, 
                subtitle: `${Number(leaveData.balance.sick).toFixed(1)} SL | ${Number(leaveData.balance.vacation).toFixed(1)} VL`, 
                icon: <FaBalanceScale size={24} />,
                color: "primary",
                bg: "primary-subtle"
              },
              { 
                title: "Pending Requests", 
                value: leaveData.pending || 0, 
                subtitle: "Awaiting approval", 
                icon: <MdPendingActions size={24} />,
                color: "warning",
                bg: "warning-subtle"
              },
              { 
                title: "Approved Leaves", 
                value: leaveData.approved || 0, 
                subtitle: "This year", 
                icon: <MdApproval size={24} />,
                color: "success",
                bg: "success-subtle"
              },
             
            ].map((stat, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className={`card border-0 bg-${stat.bg} h-100`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-2">{stat.title}</h6>
                        <h3 className="mb-1">{stat.value}</h3>
                        <small className="text-muted">{stat.subtitle}</small>
                      </div>
                      <div className={`text-${stat.color} bg-white rounded-circle p-3 d-flex align-items-center justify-content-center`} 
                           style={{ width: "50px", height: "50px" }}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Two Column Layout */}
          <div className="row g-4">
            {/* Upcoming Leaves */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaCalendarAlt className="me-2 text-primary" />
                    Upcoming Leaves
                  </h5>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setActiveTab("requests")}
                  >
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {leaveData.upcoming.length > 0 ? (
                    <div className="list-group">
                      {leaveData.upcoming.map((leave, index) => (
                        <div key={index} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3">
                          <div>
                            <strong>{leave.type}</strong>
                            <div className="text-muted">{new Date(leave.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</div>
                          </div>
                          <span className={`badge bg-${leave.status.toLowerCase() === 'approved' ? 'success' : 'warning'}`}>
                            {leave.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No upcoming leaves scheduled</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <button 
                        className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center rounded-3"
                        onClick={() => setActiveTab("apply")}
                      >
                        <FaPaperPlane size={24} className="mb-2" />
                        <span>Apply for Leave</span>
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button 
                        className="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center rounded-3"
                        onClick={() => setActiveTab("balance")}
                      >
                        <FaBalanceScale size={24} className="mb-2" />
                        <span>Check Balance</span>
                      </button>
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
      <div className="card-body">
        <ApplyForLeave user={user} onApplySuccess={() => fetchLeaveData()} />
      </div>
    </div>
  )}

  {activeTab === "requests" && (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <MyleaveRequest user={user} onStatusChange={() => fetchLeaveData()} />
      </div>
    </div>
  )}

  {activeTab === "balance" && (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <LeaveCredit user={user} leaveData={leaveData} isLoading={isLoading} />
      </div>
    </div>
  )}
  
  {activeTab === "settings" && (
    <div className="row">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0">
            <h4 className="mb-0">Profile Information</h4>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Full Name</label>
                <p className="form-control-plaintext">{user?.fullName}</p>
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <p className="form-control-plaintext">{user?.email}</p>
              </div>
              <div className="col-md-4">
                <label className="form-label">Employee ID</label>
                <p className="form-control-plaintext">{user?.employeeId || "N/A"}</p>
              </div>
            </div>
            <button className="btn btn-primary">Edit Profile</button>
          </div>
        </div>
        
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0">
            <h4 className="mb-0">Security</h4>
          </div>
          <div className="card-body">
            <button className="btn btn-outline-danger">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  )}
</main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;