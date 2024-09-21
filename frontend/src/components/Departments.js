import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import Modal from './Modal';
import './Departments.css';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await axios.put(`http://localhost:5000/departments/${editingDepartment.id}`, newDepartment);
        setEditingDepartment(null);
      } else {
        await axios.post('http://localhost:5000/departments', newDepartment);
      }
      setNewDepartment({ name: '', description: '' });
      fetchDepartments();
      closeModal();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setNewDepartment(department);
    openModal();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this department's data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:5000/departments/${id}`);
          fetchDepartments();
          swal("Poof! The department's data has been deleted!", {
            icon: "success",
          });
        } catch (error) {
          console.error('Error deleting department:', error);
          swal("Oops! Something went wrong.", {
            icon: "error",
          });
        }
      } else {
        swal("The department's data is safe!");
      }
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setNewDepartment({ name: '', description: '' });
  };

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="department-actions">
          <button className="edit-button" onClick={() => handleEdit(row)}>Edit</button>
          <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="departments-container">
      <h2>Departments</h2>
      <input
        type="text"
        placeholder="Search departments..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <button onClick={openModal} className="add-department-button">Add Department</button>
      <DataTable
        columns={columns}
        data={filteredDepartments}
        pagination
        highlightOnHover
        pointerOnHover
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>{editingDepartment ? 'Update Department' : 'Add Department'}</h2>
        <form onSubmit={handleSubmit} className="department-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newDepartment.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newDepartment.description}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingDepartment ? 'Update Department' : 'Add Department'}</button>
          <button type="button" onClick={closeModal} className="cancel-button">Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default Departments;
