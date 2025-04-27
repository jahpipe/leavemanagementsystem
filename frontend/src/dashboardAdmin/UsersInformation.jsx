import React, { useState, useEffect, useCallback } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : 
      date.toLocaleDateString("en-US", { 
        month: "short", // Changed from "long" to "short" for compactness
        day: "numeric", 
        year: "numeric" 
      });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "N/A";
  }
};

const formatCredit = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const UsersInformation = ({ user }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [leaveTransactions, setLeaveTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [nonTeachingTransactions, setNonTeachingTransactions] = useState([]);
  const [isTeachingStaff, setIsTeachingStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if user is teaching staff
  const checkTeachingStatus = useCallback(() => {
    if (!user) return false;
    const position = user.position?.toLowerCase() || '';
    const nature = user.nature_of_appointment?.toLowerCase() || '';
    return position.includes('teacher') || 
           position.includes('faculty') ||
           position.includes('instructor') ||
           nature.includes('teaching');
  }, [user]);

  // Process leave transactions - now creates separate entries for each day
  const processLeaveTransactions = useCallback((balances) => {
    if (!balances || !balances.length) return [];
    
    return balances.flatMap(balance => {
      const totalCredit = Number(balance.total_credit) || 0;
      const usedCredit = Number(balance.used_credit) || 0;
      const leaveType = balance.leave_type || 'Unknown';
      const transactions = [];
  
      // Initial balance
      transactions.push({
        id: `initial-${balance.id}`,
        date: balance.recorded_date,
        type: 'INITIAL',
        creditChange: totalCredit,
        description: 'Initial leave credit',
        recordedBy: balance.recorded_by || 'System',
        leaveType,
        isBalanceDisplay: false // Mark this as not a balance display
      });
  
      // Add deductions as separate entries for each day
      if (usedCredit > 0) {
        // If you have actual leave application dates, use them here
        // For now, we'll create separate entries for each day
        for (let i = 0; i < usedCredit; i++) {
          transactions.push({
            id: `used-${balance.id}-${i}`,
            date: balance.last_used_date || balance.recorded_date,
            type: 'DEDUCTION',
            creditChange: -1, // Each entry is 1 day
            description: `Leave used (1 day)`,
            recordedBy: balance.recorded_by || 'System',
            leaveType,
            isBalanceDisplay: false
          });
        }
      }
  
      // Current balance
      transactions.push({
        id: `balance-${balance.id}`,
        date: new Date().toISOString(), // Or use the last transaction date
        type: 'BALANCE',
        creditChange: 0, // Doesn't affect the balance
        description: 'Current balance',
        recordedBy: 'System',
        leaveType,
        isBalanceDisplay: true // Mark this as a balance display
      });
  
      return transactions;
    });
  }, []);

  // Calculate running balance for each transaction
  const calculateRunningBalance = useCallback((transactions) => {
    const balancesByType = {};
    const result = [];
    
    transactions.forEach(transaction => {
      const leaveType = transaction.leaveType;
      
      if (!balancesByType[leaveType]) {
        balancesByType[leaveType] = 0;
      }
      
      // Only update balance for actual transactions, not balance displays
      if (!transaction.isBalanceDisplay) {
        const creditChange = Number(transaction.creditChange) || 0;
        balancesByType[leaveType] += creditChange;
      }
      
      result.push({
        ...transaction,
        balanceAfter: balancesByType[leaveType],
        formattedDate: formatDate(transaction.date),
        formattedCreditChange: formatCredit(transaction.creditChange),
        formattedBalance: formatCredit(balancesByType[leaveType])
      });
    });
    
    return result;
  }, []);

  // Process non-teaching leave transactions with separate entries
  const getNonTeachingLeaveTransactions = useCallback((transactions) => {
    if (!transactions?.length) return [];

    const balances = {
      'Vacation Leave': { balance: 0 },
      'Sick Leave': { balance: 0 }
    };

    // Process each transaction individually
    return transactions
      .filter(t => t.type === 'INITIAL' || t.type === 'ACCRUAL' || t.type === 'DEDUCTION')
      .sort((a, b) => {
        // First sort by date
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        
        // If same date, preserve original order using sequence number
        return (a.sequence || 0) - (b.sequence || 0);
      })
      .map(t => {
        const isVacation = t.leaveType === 'Vacation Leave';
        const creditAmount = Number(t.creditChange) || 0;
        const isDeduction = t.type === 'DEDUCTION';

        // Create individual entry for each transaction
        const entry = {
          id: t.id,
          date: t.date,
          formattedDate: formatDate(t.date),
          type: t.type,
          description: t.description || (isDeduction ? 'Leave used' : 'Initial leave credit'),
          recordedBy: t.recordedBy || 'System',
          vacation: {
            earned: isVacation && !isDeduction ? creditAmount : 0,
            used: isVacation && isDeduction ? Math.abs(creditAmount) : 0,
            balance: balances['Vacation Leave'].balance,
            formattedBalance: formatCredit(balances['Vacation Leave'].balance)
          },
          sick: {
            earned: !isVacation && !isDeduction ? creditAmount : 0,
            used: !isVacation && isDeduction ? Math.abs(creditAmount) : 0,
            balance: balances['Sick Leave'].balance,
            formattedBalance: formatCredit(balances['Sick Leave'].balance)
          }
        };

        // Update running balances
        if (isVacation) {
          balances['Vacation Leave'].balance += isDeduction ? -Math.abs(creditAmount) : creditAmount;
          entry.vacation.balance = balances['Vacation Leave'].balance;
          entry.vacation.formattedBalance = formatCredit(entry.vacation.balance);
        } else {
          balances['Sick Leave'].balance += isDeduction ? -Math.abs(creditAmount) : creditAmount;
          entry.sick.balance = balances['Sick Leave'].balance;
          entry.sick.formattedBalance = formatCredit(entry.sick.balance);
        }

        return entry;
      });
  }, []);

  // Initialize data
  useEffect(() => {
    if (!user) return;
    setIsTeachingStaff(checkTeachingStatus());
  }, [user, checkTeachingStatus]);

  useEffect(() => {
    if (!user?.leaveBalances) return;

    setIsLoading(true);
    try {
      const processed = processLeaveTransactions(user.leaveBalances);
      const calculated = calculateRunningBalance(processed);
      setLeaveTransactions(calculated);

      // Group transactions by leave type
      const grouped = calculated.reduce((acc, transaction) => {
        const leaveType = transaction.leaveType;
        acc[leaveType] = acc[leaveType] || [];
        acc[leaveType].push(transaction);
        return acc;
      }, {});
      
      setGroupedTransactions(grouped);

      // Prepare non-teaching transactions if needed
      if (!isTeachingStaff) {
        setNonTeachingTransactions(getNonTeachingLeaveTransactions(calculated));
      }
    } catch (error) {
      console.error('Error processing leave data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isTeachingStaff, processLeaveTransactions, calculateRunningBalance, getNonTeachingLeaveTransactions]);

  // Combine current and historical employment records
  const employmentRecords = [
    {
      isCurrent: true,
      special_order_no: user?.special_order_no,
      status_of_employment: user?.status_of_employment,
      effective_date: user?.effective_date,
      salary: user?.salary,
      position: user?.position,
      nature_of_appointment: user?.nature_of_appointment,
      school_assignment: user?.school_assignment,
      date_changed: user?.effective_date,
    },
    ...(user?.employment_history || []).map(history => ({
      ...history,
      effective_date: history.effective_date || history.date_changed,
    }))
  ].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));

  if (!user) {
    return <div className="text-center p-4">No user data available.</div>;
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading leave data...</div>;
  }

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "info" ? "active" : ""}`} 
            onClick={() => setActiveTab("info")}
          >
            User Information
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === (isTeachingStaff ? "leave" : "nonTeachingLeave") ? "active" : ""}`} 
            onClick={() => setActiveTab(isTeachingStaff ? "leave" : "nonTeachingLeave")}
          >
            Leave Card
          </button>
        </li>
      </ul>

      <div className="border border-dark p-4">
        {/* User Information Tab */}
        {activeTab === "info" && (
          <>
            <div className="text-center mb-4">
              <p className="fw-bold">Department of Education</p>
              <p className="fw-bold">Schools Division of Baybay City</p>
            </div>
            <div className="text-center mb-4">
              <p className="fw-bold fs-4">
                {isTeachingStaff ? "TEACHER'S RECORD CARD" : "EMPLOYEE RECORD CARD"}
              </p>
            </div>
            
            <div className="table table-bordered mb-4 border border-dark">
              <div className="row">
                <div className="col-2 fw-bold border border-dark">Name:</div>
                <div className="col-3 text-center fw-bold border border-dark">{user.lastName || "N/A"}</div>
                <div className="col-3 text-center fw-bold border border-dark">{user.fullName || "N/A"}</div>
                <div className="col-4 text-center fw-bold border border-dark">{user.middleName || "N/A"}</div>
              </div>
              <div className="row">
                <div className="col-2 border border-dark"></div>
                <div className="col-3 text-center border border-dark">Last Name</div>
                <div className="col-3 text-center border border-dark">First Name</div>
                <div className="col-4 text-center border border-dark">Middle Name</div>
              </div>
            </div>

            <div className="table table-bordered mb-4 border border-dark">
              <div className="row">
                <div className="col-2 fw-bold border border-dark">Place of Birth:</div>
                <div className="col-4 text-center fw-bold border border-dark">{user.place_of_birth || "N/A"}</div>
                <div className="col-2 fw-bold border border-dark">Date of Birth:</div>
                <div className="col-4 text-center fw-bold border border-dark">{formatDate(user.date_of_birth)}</div>
              </div>
              <div className="row">
                <div className="col-6 border border-dark"></div>
                <div className="col-6 text-center border border-dark">(Month/Day/Year)</div>
              </div>
            </div>

            <div className="table table-bordered mb-4 border border-dark">
              <div className="row">
                <div className="col-2 fw-bold border border-dark">Permanent Address:</div>
                <div className="col-10 text-center fw-bold border border-dark">{user.permanent_address || "N/A"}</div>
              </div>
            </div>

            <div className="table table-bordered mt-4 border border-dark text-center">
              <div className="row fw-bold border border-dark">
                <div className="col border border-dark">Special Order No.</div>
                <div className="col border border-dark">Status</div>
                <div className="col border border-dark">Effective Date</div>
                <div className="col border border-dark">Salary</div>
                <div className="col border border-dark">Position</div>
                <div className="col border border-dark">Nature</div>
                <div className="col border border-dark">School</div>
              </div>

              {employmentRecords.map((record, index) => (
                <div className={`row border border-dark ${record.isCurrent ? "bg-light" : ""}`} key={index}>
                  <div className="col border border-dark">{record.special_order_no || "N/A"}</div>
                  <div className="col border border-dark">{record.status_of_employment || "N/A"}</div>
                  <div className="col border border-dark">{formatDate(record.effective_date)}</div>
                  <div className="col border border-dark">{record.salary || "N/A"}</div>
                  <div className="col border border-dark">{record.position || "N/A"}</div>
                  <div className="col border border-dark">{record.nature_of_appointment || "N/A"}</div>
                  <div className="col border border-dark">{record.school_assignment || "N/A"}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Teaching Leave Card Tab */}
        {activeTab === "leave" && isTeachingStaff && (
          <div className="w-100">
            <div className="container mt-4">
              <h5 className="text-center fw-bold">Department of Education</h5>
              <h6 className="text-center">Schools Division of Baybay City</h6>
              <h4 className="text-center fw-bold">TEACHER'S LEAVE CARD</h4>


              <table className="table table-bordered mt-4">
                <tbody>
                  <tr>
                    <td colSpan="2">
                      <strong>Name:</strong> 
                      <span className="fw-bold ms-1">{user.lastName || "N/A"}</span> 
                      {user.fullName || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Station/Place of Assignment:</strong> 
                      {user.school_assignment || "N/A"}
                    </td>
                    <td>
                      <strong>First Day of Service:</strong> 
                      {formatDate(user.effective_date)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {Object.entries(groupedTransactions).map(([leaveType, transactions]) => (
                <div key={leaveType} className="mt-4">
                  <h5 className="fw-bold bg-light p-2">{leaveType}</h5>
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>PERIOD</th>
                        <th>PARTICULARS</th>
                        <th colSpan="3">LEAVE CREDIT</th>
                        <th>Recorded by/Date</th>
                      </tr>
                      <tr>
                        <th></th>
                        <th></th>
                        <th>Earned</th>
                        <th>Used</th>
                        <th>Balance</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={`${transaction.id}-${transaction.sequence}`}>
                          <td>
                            {transaction.formattedDate}
                            <small className="text-muted d-block">
                              {transaction.type === 'INITIAL' ? 'Initial' : 
                               transaction.type === 'ACCRUAL' ? 'Accrual' : 'Deduction'}
                            </small>
                          </td>
                          <td className="text-start">{transaction.description}</td>
                          <td>
                            {transaction.type === 'DEDUCTION' ? '' : transaction.formattedCreditChange}
                          </td>
                          <td>
                            {transaction.type === 'DEDUCTION' ? 
                              transaction.formattedCreditChange.replace('-', '') : ''}
                          </td>
                          <td>{transaction.formattedBalance}</td>
                          <td>
                            {transaction.recordedBy || "System"} / {transaction.formattedDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {leaveTransactions.length === 0 && (
                <div className="alert alert-info mt-3">
                  No leave records available for this employee
                </div>
              )}
            </div>
          </div>
        )}

    
{activeTab === "nonTeachingLeave" && !isTeachingStaff && (
          <div className="w-100">
            <div className="container mt-4">
              <h5 className="text-center fw-bold">Department of Education</h5>
              <h6 className="text-center">Schools Division of Baybay City</h6>
              <h4 className="text-center fw-bold">EMPLOYEE'S LEAVE CARD</h4>

              <table className="table table-bordered text-center mt-4">
                <thead>
                  <tr>
                    <th rowSpan="2">PERIOD</th>
                    <th rowSpan="2">PARTICULARS</th>
                    <th colSpan="3">VACATION LEAVE</th>
                    <th colSpan="3">SICK LEAVE</th>
                    <th rowSpan="2">RECORDED BY</th>
                  </tr>
                  <tr>
                    <th>Earned</th>
                    <th>Used</th>
                    <th>Balance</th>
                    <th>Earned</th>
                    <th>Used</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {nonTeachingTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.formattedDate}</td>
                      <td className="text-start">
                        {transaction.description}
                        {transaction.type !== 'BALANCE' && (
                          <small className="text-muted d-block">
                            {transaction.type === 'INITIAL' ? 'Initial credit' : 
                             transaction.type === 'ACCRUAL' ? 'Monthly accrual' : 'Deduction'}
                          </small>
                        )}
                      </td>
                      <td>{transaction.vacation.earned > 0 ? formatCredit(transaction.vacation.earned) : ''}</td>
                      <td>{transaction.vacation.used > 0 ? formatCredit(transaction.vacation.used) : ''}</td>
                      <td>{transaction.vacation.formattedBalance}</td>
                      <td>{transaction.sick.earned > 0 ? formatCredit(transaction.sick.earned) : ''}</td>
                      <td>{transaction.sick.used > 0 ? formatCredit(transaction.sick.used) : ''}</td>
                      <td>{transaction.sick.formattedBalance}</td>
                      <td>{transaction.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersInformation;