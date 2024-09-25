import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import Modal from './Modal';
import './Employees.css';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', email: '', phone: '', department: '', password: '' });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://hr-management-ps0b.onrender.com/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('https://hr-management-ps0b.onrender.com/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get('https://hr-management-ps0b.onrender.com/positions');
      setPositions(response.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await axios.put(`https://hr-management-ps0b.onrender.com/employees/${editingEmployee.id}`, newEmployee);
        setEditingEmployee(null);
      } else {
        await axios.post('https://hr-management-ps0b.onrender.com/employees', newEmployee);
      }
      setNewEmployee({ name: '', position: '', email: '', phone: '', department: '', password: '' });
      fetchEmployees();
      closeModal();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee(employee);
    openModal();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this employee's data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`https://hr-management-ps0b.onrender.com/employees/${id}`);
          fetchEmployees();
          swal("Poof! The employee's data has been deleted!", {
            icon: "success",
          });
        } catch (error) {
          console.error('Error deleting employee:', error);
          swal("Oops! Something went wrong.", {
            icon: "error",
          });
        }
      } else {
        swal("The employee's data is safe!");
      }
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setNewEmployee({ name: '', position: '', email: '', phone: '', department: '', password: '' });
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Position',
      selector: row => row.position,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: row => row.phone,
      sortable: true,
    },
    {
      name: 'Department',
      selector: row => row.department,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="employee-actions">
          <button className="edit-button" onClick={() => handleEdit(row)}>Edit</button>
          <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="employees-container">
      <h2>Employees</h2>
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <button onClick={openModal} className="add-employee-button">Add Employee</button>
      <DataTable
        columns={columns}
        data={filteredEmployees}
        pagination
        highlightOnHover
        pointerOnHover
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>{editingEmployee ? 'Update Employee' : 'Add Employee'}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newEmployee.name}
            onChange={handleChange}
            required
          />
          <select name="department" value={newEmployee.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
          <select name="position" value={newEmployee.position} onChange={handleChange} required>
            <option value="">Select Position</option>
            {positions.map((position) => (
              <option key={position.id} value={position.name}>
                {position.name}
              </option>
            ))}
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={newEmployee.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {editingEmployee ? 'Update Employee' : 'Add Employee'}
          </button>
          <button type="button" onClick={closeModal} className="cancel-button">Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default Employees;
