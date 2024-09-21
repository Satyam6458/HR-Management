import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHome, 
  FaBriefcaseMedical, 
  FaUmbrellaBeach, 
  FaHeart, 
  FaHandHoldingHeart, 
  FaUserTie 
} from 'react-icons/fa';
import './EmployeeDashboard.css';

function EmployeeDashboard({ employee, setEmployee }) {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Add the useLocation hook

  // Load employee data from localStorage when the component mounts
  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      navigate('/employeelogin'); // Redirect to login if no employee data is found
    }
  }, [setEmployee, navigate]);

  // Fetch leave balance data
  useEffect(() => {
    if (employee) {
      axios.get(`http://localhost:5000/employee/${employee.id}/leavebalance`)
        .then(response => {
          setLeaveBalance(response.data);
        })
        .catch(error => {
          console.error('Error fetching leave balance:', error);
        });
    }
  }, [employee]);

  const handleLogout = () => {
    setEmployee(null);
    localStorage.removeItem('employee'); // Clear localStorage on logout
    navigate('/employeelogin');
  };

  if (!employee) {
    return <div className="loading">Loading...</div>;
  }

  const leaveIcons = {
    'Personal Leave': <FaHome />,
    'Sick Leave': <FaBriefcaseMedical />,
    'Compoff Leave': <FaUmbrellaBeach />,
    'Loss Of Pay': <FaHeart />,
    'Casual Leave': <FaHandHoldingHeart />,
    'Marriage Leave': <FaUserTie />,
  };

  // Define routes where the leave balance should not be displayed
  const hideLeaveBalanceRoutes = [
    '/employeedashboard/profile',
    '/employeedashboard/leaveapplication',
    '/employeedashboard/leavehistory',
    '/employeedashboard/settings'
  ];

  const shouldHideLeaveBalance = hideLeaveBalanceRoutes.includes(location.pathname);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Employee Dashboard</h2>
        <ul>
          <li><Link to="/employeedashboard/profile">Profile</Link></li>
          <li><Link to="/employeedashboard/leaveapplication">Apply for Leave</Link></li>
          <li><Link to="/employeedashboard/leavehistory">Leave History</Link></li>
          <li><Link to="/employeedashboard/settings">Settings</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Welcome, {employee.name}</h1>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <div className="content">
          {!shouldHideLeaveBalance && ( // Conditionally render the leave balance section
            leaveBalance ? (
              <div className="leave-balance">
                <h3>Leave Balance</h3>
                <div className="leave-tiles">
                  {Object.entries(leaveBalance).map(([key, value]) => (
                    <div className="leave-tile" key={key}>
                      <div className="icon">{leaveIcons[key]}</div>
                      <h4>{key}</h4>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Loading leave balance...</p>
            )
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
