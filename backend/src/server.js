const express = require('express')
const mysql = require('mysql2');
const cors = require('cors');

const router = express.Router();


const loginRouter = require('./routes/login/login');
const registerRouter = require('./routes/register/register');
const viewemployeRouter = require('./routes/viewemploye/viewemploye'); 
const leaveRouter = require('./routes/leaves/leaves');
const leaveApprovalRouter = require("./routes/leaveaporval/leaveaproval");
const leaverequestRouter = require('./routes/leaverequest/leaverequest');
const creditbalanceRouter = require("./routes/creditbalance/creditbalance");

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
  console.log('Connected to MySQL using environment variables');
});

// API CONNECTION
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/users', viewemployeRouter);
app.use('/api/leave', leaveRouter);
app.use("/api/leaveapproval", leaveApprovalRouter);
app.use('api/leaverequest', leaverequestRouter);
app.use("/api/creditbalance", creditbalanceRouter);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});