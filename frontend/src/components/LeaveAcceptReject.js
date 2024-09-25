import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './LeaveAcceptReject.css';

function LeaveAcceptReject() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [search, setSearch] = useState('');

  // Fetch leave applications from the server
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get('https://hr-management-ps0b.onrender.com/leaves');
        setLeaves(response.data);
        sortAndFilterLeaves(response.data, search); // Ensure the search is included in sorting/filtering
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    };
  
    fetchLeaves();
  }, [search]); // Add 'search' as a dependency
  

  // Function to update the status of a leave application
  const updateStatus = async (leaveId, status) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to ${status} this leave?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${status}`,
        cancelButtonText: 'No, cancel',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        const response = await axios.put(`https://hr-management-ps0b.onrender.com/leaves/${leaveId}`, { status });
        if (response.data.success) {
          const updatedLeaves = leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status } : leave
          );
          setLeaves(updatedLeaves);
          sortAndFilterLeaves(updatedLeaves, search);
          Swal.fire(
            `${status.charAt(0).toUpperCase() + status.slice(1)}!`,
            `Leave ${status} successfully.`,
            'success'
          );
        } else {
          Swal.fire('Error', response.data.message, 'error');
        }
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      Swal.fire('Error', 'There was a problem updating the leave status.', 'error');
    }
  };

  const columns = [
    { name: 'Employee ID', selector: row => row.employeeId, sortable: true },
    { name: 'Employee Name', selector: row => row.employeeName, sortable: true },
    { name: 'Start Date', selector: row => row.startDate, sortable: true },
    { name: 'End Date', selector: row => row.endDate, sortable: true },
    { name: 'Reason', selector: row => row.reason, sortable: false },
    { name: 'Leave Type', selector: row => row.leaveType, sortable: true },
    { name: 'Status', selector: row => row.status, sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div className="button-container">
          <button
            onClick={() => updateStatus(row.id, 'approved')}
            className="approve-button"
            disabled={row.status === 'approved' || row.status === 'rejected' || row.status === 'Withdrawn'}
          >
            <FaCheck />
          </button>
          <button
            onClick={() => updateStatus(row.id, 'rejected')}
            className="reject-button"
            disabled={row.status === 'approved' || row.status === 'rejected' || row.status === 'Withdrawn'}
          >
            <FaTimes />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  // Function to sort and filter leaves
  const sortAndFilterLeaves = (leaves, search) => {
    const filteredData = leaves.filter((leave) =>
      Object.values(leave).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );

    // Sort the filtered leaves to show pending leaves at the top
    const sortedData = filteredData.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });

    setFilteredLeaves(sortedData);
  };

  // Filter leaves based on search input
  useEffect(() => {
    sortAndFilterLeaves(leaves, search);
  }, [search, leaves]);

  return (
    <div className="leave-accept-reject-container">
      <h2>Manage Leave Applications</h2>
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

export default LeaveAcceptReject;
