import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaUsers,
  FaClock
} from 'react-icons/fa';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';


ChartJS.register(...registerables);

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEmployees: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      lowBalanceAlerts: 0
    },
    leaveTrends: [],
    leaveTypes: [],
    recentActivities: [],
    lowBalanceDetails: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const leaveTrendData = {
    labels: dashboardData.leaveTrends.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: [{
      label: 'Leave Requests',
      data: dashboardData.leaveTrends.map(item => item.count),
      backgroundColor: '#4e73df',
      borderColor: '#2e59d9',
      borderWidth: 1
    }]
  };

  const leaveTypeData = {
    labels: dashboardData.leaveTypes.map(item => item.name),
    datasets: [{
      data: dashboardData.leaveTypes.map(item => item.count),
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
      hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a']
    }]
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4 fw-bold">Admin Dashboard</h3>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      ) : (
        <>
      
          <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Employees
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {dashboardData.stats.totalEmployees}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaUsers className="fas fa-calendar fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Pending Requests
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {dashboardData.stats.pendingRequests}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaClock className="fas fa-comments fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Approved (This Month)
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {dashboardData.stats.approvedRequests}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaCheckCircle className="fas fa-check fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

    
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-danger shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                        Low Balance Alerts
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {dashboardData.stats.lowBalanceAlerts}
                      </div>
                    </div>
                    <div className="col-auto">
                      <FaExclamationTriangle className="fas fa-exclamation fa-2x text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="row">

            <div className="col-xl-8 col-lg-7">
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 font-weight-bold text-primary">Leave Requests Trend</h6>
                </div>
                <div className="card-body">
                  <div className="chart-area">
                    <Bar 
                      data={leaveTrendData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="col-xl-4 col-lg-5">
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 font-weight-bold text-primary">Leave Types Distribution</h6>
                </div>
                <div className="card-body">
                  <div className="chart-pie pt-4 pb-2">
                    <Pie 
                      data={leaveTypeData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {dashboardData.recentActivities.map(activity => (
                      <div key={activity.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{activity.user}</strong> {activity.action}
                          </div>
                          <small className="text-muted">
                            {formatDate(activity.time)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          
            {dashboardData.stats.lowBalanceAlerts > 0 && (
              <div className="col-lg-12 mb-4">
                <div className="card shadow">
                  <div className="card-header py-3 d-flex justify-content-between align-items-center bg-danger text-white">
                    <h6 className="m-0 font-weight-bold">Low Balance Alerts</h6>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-danger d-flex align-items-center">
                      <FaExclamationTriangle className="me-3 fs-4" />
                      <div>
                        <strong>{dashboardData.stats.lowBalanceAlerts} employees</strong> have less than 2 days of leave remaining.
                        <a href="/manage-balance" className="alert-link ms-2">Review now</a>
                      </div>
                    </div>
                    {dashboardData.lowBalanceDetails.length > 0 && (
                      <div className="mt-3">
                        <h6 className="mb-2">Employees with low balances:</h6>
                        <ul className="list-group">
                          {dashboardData.lowBalanceDetails.map((emp, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              {emp.name} - {emp.leaveType}
                              <span className="badge bg-danger rounded-pill">
                                {emp.remaining} days left
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;