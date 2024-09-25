import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import Modal from './Modal';
import './Positions.css';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPosition, setNewPosition] = useState({ name: '', description: '' });
  const [editingPosition, setEditingPosition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

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
    setNewPosition({ ...newPosition, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        await axios.put(`https://hr-management-ps0b.onrender.com/positions/${editingPosition.id}`, newPosition);
        setEditingPosition(null);
      } else {
        await axios.post('https://hr-management-ps0b.onrender.com/positions', newPosition);
      }
      setNewPosition({ name: '', description: '' });
      fetchPositions();
      closeModal();
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setNewPosition(position);
    openModal();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this position's data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`https://hr-management-ps0b.onrender.com/positions/${id}`);
          fetchPositions();
          swal("Poof! The position's data has been deleted!", {
            icon: "success",
          });
        } catch (error) {
          console.error('Error deleting position:', error);
          swal("Oops! Something went wrong.", {
            icon: "error",
          });
        }
      } else {
        swal("The position's data is safe!");
      }
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
    setNewPosition({ name: '', description: '' });
  };

  const filteredPositions = positions.filter((position) =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="position-actions">
          <button className="edit-button" onClick={() => handleEdit(row)}>Edit</button>
          <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="positions-container">
      <h2>Positions</h2>
      <input
        type="text"
        placeholder="Search positions..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <button onClick={openModal} className="add-position-button">Add Position</button>
      <DataTable
        columns={columns}
        data={filteredPositions}
        pagination
        highlightOnHover
        pointerOnHover
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>{editingPosition ? 'Update Position' : 'Add Position'}</h2>
        <form onSubmit={handleSubmit} className="position-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newPosition.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newPosition.description}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingPosition ? 'Update Position' : 'Add Position'}</button>
          <button type="button" onClick={closeModal} className="cancel-button">Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default Positions;
