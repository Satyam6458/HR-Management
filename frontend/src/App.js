import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Overview from './components/Overview'; 
import Employees from './components/Employees';
import Departments from './components/Departments';
import Positions from './components/Positions';
import Holidays from './components/Holidays';
import LeaveTypes from './components/LeaveTypes';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './components/EmployeeDashboard';
import Profile from './components/Profile';
import LeaveApplication from './components/LeaveApplication';
import LeaveHistory from './components/LeaveHistory';
import Settings from './components/Settings';
import LeaveAcceptReject from './components/LeaveAcceptReject';
import './App.css';

function App() {
  const [employee, setEmployee] = useState(null);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="overview" element={<Overview />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="positions" element={<Positions />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="leavetypes" element={<LeaveTypes />} />
            <Route path="leaveacceptreject" element={<LeaveAcceptReject />} />
          </Route>
          <Route path="/employeelogin" element={<EmployeeLogin setEmployee={setEmployee} />} />
          <Route path="/employeedashboard" element={<EmployeeDashboard employee={employee} setEmployee={setEmployee} />}>
          <Route path="profile" element={<Profile employee={employee} />} />
          <Route path="leaveapplication" element={<LeaveApplication employee={employee} />} />
          <Route path="leavehistory" element={<LeaveHistory employee={employee} />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        </Routes>
      </Router>
    </div>
  );
}

export default App;
