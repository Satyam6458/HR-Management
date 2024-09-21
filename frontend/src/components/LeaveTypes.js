import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import Modal from './Modal';
import './LeaveTypes.css';

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newLeaveType, setNewLeaveType] = useState({ name: '', description: '' });
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveType({ ...newLeaveType, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLeaveType) {
        await axios.put(`http://localhost:5000/leave-types/${editingLeaveType.id}`, newLeaveType);
        setEditingLeaveType(null);
      } else {
        await axios.post('http://localhost:5000/leave-types', newLeaveType);
      }
      setNewLeaveType({ name: '', description: '' });
      fetchLeaveTypes();
      closeModal();
    } catch (error) {
      console.error('Error saving leave type:', error);
    }
  };

  const handleEdit = (leaveType) => {
    setEditingLeaveType(leaveType);
    setNewLeaveType(leaveType);
    openModal();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this leave type's data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:5000/leave-types/${id}`);
          fetchLeaveTypes();
          swal("Poof! The leave type's data has been deleted!", {
            icon: "success",
          });
        } catch (error) {
          console.error('Error deleting leave type:', error);
          swal("Oops! Something went wrong.", {
            icon: "error",
          });
        }
      } else {
        swal("The leave type's data is safe!");
      }
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLeaveType(null);
    setNewLeaveType({ name: '', description: '' });
  };

  const filteredLeaveTypes = leaveTypes.filter((leaveType) =>
    leaveType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="leave-type-actions">
          <button className="edit-button" onClick={() => handleEdit(row)}>Edit</button>
          <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="leave-types-container">
      <h2>Leave Types</h2>
      <input
        type="text"
        placeholder="Search leave types..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <button onClick={openModal} className="add-leave-type-button">Add Leave Type</button>
      <DataTable
        columns={columns}
        data={filteredLeaveTypes}
        pagination
        highlightOnHover
        pointerOnHover
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>{editingLeaveType ? 'Update Leave Type' : 'Add Leave Type'}</h2>
        <form onSubmit={handleSubmit} className="leave-type-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newLeaveType.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newLeaveType.description}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingLeaveType ? 'Update Leave Type' : 'Add Leave Type'}</button>
          <button type="button" onClick={closeModal} className="cancel-button">Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default LeaveTypes;
