const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const router = express.Router();
const path = require('path');
const loginRouter = require('./routes/login/login');
const registerRouter = require('./routes/register/register');
const viewemployeRouter = require('./routes/viewemploye/viewemploye'); 
const leaverequestRouter = require('./routes/leaverequest/leaverequest');
const leaveRouter = require("./routes/leaves/leaves");
const leaveapprovalRouter = require('./routes/leaveaporval/leaveaproval');
const leaveBalanceRoutes = require('./routes/leavebalance/leavebalance');
const reportsRoutes = require('./routes/reports/reports');
const adminRoutes = require('./routes/Dashboard/dashboard');
const employeeRoutes = require('./routes/EmpDashboard/empdashboard'); 
const leavecardRoutes = require('./routes/leavecard/leavecard');
const empdashboardRouter = require('./routes/EmpDashboard/empdashboard');
const ProfileRoutes = require('./routes/Profiles/profile');


// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leave_db',  
    port: '3306'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// API CONNECTION
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/users', viewemployeRouter);
app.use('/api/leaverequest', leaverequestRouter);
app.use("/api/leave", leaveRouter);
app.use('/api/leaveapproval', leaveapprovalRouter);
app.use("/api", leaveBalanceRoutes);
app.use("/api/reports", reportsRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/employee', employeeRoutes);
app.use('/api/leavecard', leavecardRoutes);
app.use('/api/empdashboard', empdashboardRouter);
app.use("/api/profile", ProfileRoutes);


app.use("/images", express.static(path.join(__dirname, "public", "images")));



// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://10.2.1.58:${PORT}`);
});
