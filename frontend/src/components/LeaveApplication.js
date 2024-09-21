import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './LeaveApplication.css';

function LeaveApplication({ employee }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/leavetypes');
        setLeaveTypes(response.data);
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/leaveapplication', {
        employeeId: employee.id,
        startDate,
        endDate,
        reason,
        leaveType,
      });

      if (response.data.success) {
        Swal.fire('Success', 'Leave applied successfully', 'success');
        setStartDate('');
        setEndDate('');
        setReason('');
        setLeaveType('');
      }
    } catch (error) {
      if (error.response) {
        // Show server response message
        Swal.fire('Error', error.response.data.message, 'error');
      } else {
        // Show generic error message
        Swal.fire('Error', 'There was a problem applying for leave.', 'error');
      }
    }
  };

  return (
    <div className="leave-application-container">
      <h2>Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="leave-application-form">
        <div className="form-group">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate('');
              }
            }}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reason">Reason:</label>
          <textarea
            id="reason"
            placeholder="Enter reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="leave-type">Leave Type:</label>
          <select
            id="leave-type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">Apply</button>
      </form>
    </div>
  );
}

export default LeaveApplication;
