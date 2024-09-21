import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import Modal from './Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import enIN from 'date-fns/locale/en-IN';
import './Holidays.css';

// Register and set the locale for date picker
registerLocale('en-IN', enIN);
setDefaultLocale('en-IN');

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newHoliday, setNewHoliday] = useState({ name: '', date: null, description: '' });
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const indianHolidays = [
    { name: 'New Year', date: '2024-01-01' },
    { name: 'Republic Day', date: '2024-01-26' },
    { name: 'Holi', date: '2024-03-25' },
    { name: 'Independence Day', date: '2024-08-15' },
    { name: 'Gandhi Jayanti', date: '2024-10-02' },
    { name: 'Diwali', date: '2024-11-01' },
    { name: 'Christmas', date: '2024-12-25' },
  ];

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('http://localhost:5000/holidays');
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday({ ...newHoliday, [name]: value });
  };

  const handleDateChange = (date) => {
    setNewHoliday({ ...newHoliday, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const holidayData = {
        ...newHoliday,
        date: newHoliday.date ? newHoliday.date.toISOString().split('T')[0] : null,
      };
      if (editingHoliday) {
        await axios.put(`http://localhost:5000/holidays/${editingHoliday.id}`, holidayData);
        setEditingHoliday(null);
      } else {
        await axios.post('http://localhost:5000/holidays', holidayData);
      }
      setNewHoliday({ name: '', date: null, description: '' });
      fetchHolidays();
      closeModal();
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday({ ...holiday, date: new Date(holiday.date) });
    openModal();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this holiday's data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:5000/holidays/${id}`);
          fetchHolidays();
          swal("Poof! The holiday's data has been deleted!", {
            icon: "success",
          });
        } catch (error) {
          console.error('Error deleting holiday:', error);
          swal("Oops! Something went wrong.", {
            icon: "error",
          });
        }
      } else {
        swal("The holiday's data is safe!");
      }
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHoliday(null);
    setNewHoliday({ name: '', date: null, description: '' });
  };

  const filteredHolidays = holidays.filter((holiday) =>
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => new Date(row.date).toLocaleDateString('en-GB'),
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
        <div className="holiday-actions">
          <button className="edit-button" onClick={() => handleEdit(row)}>Edit</button>
          <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  const holidayDates = indianHolidays.map((holiday) => new Date(holiday.date));

  return (
    <div className="holidays-container">
      <h2>Holidays</h2>
      <input
        type="text"
        placeholder="Search holidays..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <button onClick={openModal} className="add-holiday-button">Add Holiday</button>
      <DataTable
        columns={columns}
        data={filteredHolidays}
        pagination
        highlightOnHover
        pointerOnHover
      />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>{editingHoliday ? 'Update Holiday' : 'Add Holiday'}</h2>
        <form onSubmit={handleSubmit} className="holiday-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newHoliday.name}
            onChange={handleChange}
            required
          />
          <DatePicker
            selected={newHoliday.date}
            onChange={handleDateChange}
            dateFormat="dd-MM-yyyy"
            minDate={new Date()}
            highlightDates={holidayDates}
            locale="en-IN"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newHoliday.description}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingHoliday ? 'Update Holiday' : 'Add Holiday'}</button>
          <button type="button" onClick={closeModal} className="cancel-button">Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default Holidays;
