// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setEmail(''); // Set an empty string if no email is found
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>HR Dashboard</h2>
        <ul>
          <li><Link to="/dashboard/employees">Employees</Link></li>
          <li><Link to="/dashboard/positions">Position</Link></li>
          <li><Link to="/dashboard/departments">Department</Link></li>
          <li><Link to="/dashboard/holidays">Holidays</Link></li>
          <li><Link to="/dashboard/leavetypes">Leave Types</Link></li>
          <li><Link to="/dashboard/leaveacceptreject">Leave Application</Link></li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="header">
          <h1>Welcome, {email}</h1> {/* Display the user's email */}
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
