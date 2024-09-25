import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import './LeaveHistory.css';

function LeaveHistory({ employee }) {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const response = await axios.get(`https://hr-management-ps0b.onrender.com/leavehistory/${employee.id}`);
        setLeaveHistory(response.data);
        setFilteredLeaves(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        setError('Failed to fetch leave history');
        setLoading(false);
      }
    };

    fetchLeaveHistory();
  }, [employee.id]);

  const handleWithdraw = async (leaveId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure you want to withdraw this leave?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, withdraw it!',
        cancelButtonText: 'No, keep it',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        const response = await axios.put(`https://hr-management-ps0b.onrender.com/withdrawLeave/${leaveId}`);
        if (response.data.success) {
          setLeaveHistory(response.data.updatedLeaves);
          setFilteredLeaves(response.data.updatedLeaves);
          Swal.fire('Withdrawn!', 'Your leave has been withdrawn.', 'success');
        } else {
          Swal.fire('Error', response.data.message, 'error');
        }
      }
    } catch (error) {
      console.error('Error withdrawing leave:', error);
      Swal.fire('Error', 'There was a problem withdrawing the leave.', 'error');
    }
  };

  const columns = [
    { name: 'Start Date', selector: row => new Date(row.startDate).toLocaleDateString(), sortable: true },
    { name: 'End Date', selector: row => new Date(row.endDate).toLocaleDateString(), sortable: true },
    { name: 'Reason', selector: row => row.reason, sortable: false },
    { name: 'Leave Type', selector: row => row.leaveType, sortable: true },
    {
      name: 'Status',
      selector: row => row.status,
      cell: row => (
        <span className={row.status === 'approved' ? 'status-approved' : row.status === 'rejected' ? 'status-rejected' : ''}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <button
          onClick={() => handleWithdraw(row.id)}
          className="withdraw-button"
          disabled={row.status !== 'Pending' || new Date(row.startDate) <= new Date()}
        >
          Withdraw
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  useEffect(() => {
    const filteredData = leaveHistory.filter((leave) =>
      Object.values(leave).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredLeaves(filteredData);
  }, [search, leaveHistory]);

  if (loading) {
    return <div className="leave-history-loading">Loading...</div>;
  }

  if (error) {
    return <div className="leave-history-error">Error: {error}</div>;
  }

  return (
    <div className="leave-history-container">
      <h2>Leave History</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search leaves"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredLeaves}
        pagination
        highlightOnHover
        responsive
        subHeader
      />
    </div>
  );
}

export default LeaveHistory;
