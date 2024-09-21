import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Profile.css';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function Profile({ employee }) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  };

  const parseDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!employee?.id) {
        setError('Employee ID is not available');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/profile/${employee.id}`);
        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          ...profileData,
          joiningdate: formatDate(profileData.joiningdate),
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [employee, updateTrigger, formatDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (formData.joiningdate) data.set('joiningdate', formatDate(formData.joiningdate));

      const response = await axios.put(`http://localhost:5000/profile/${employee.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(response.data);
      setFormData({
        ...response.data,
        joiningdate: formatDate(response.data.joiningdate),
      });
      setIsEditing(false);
      setUpdateTrigger(!updateTrigger);
    } catch (err) {
      setError('Failed to save profile');
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-cover-photo">
        <img src="http://localhost:5000/cover-photo.jpg" alt="Cover" />
      </div>
      <div className="profile-header">
        <div className="profile-photo">
          <img src={profile.photo ? `http://localhost:5000/${profile.photo}` : 'default-profile.jpg'} alt="Profile" />
        </div>
        <div className="profile-header-info">
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-bio">{profile.bio || "No bio available"}</p>
          {!isEditing && <button onClick={() => setIsEditing(true)}><FaEdit /> Edit Profile</button>}
        </div>
      </div>

      {isEditing ? (
        <form className="profile-edit-form">
          <InputField label="Name" id="name" value={formData.name} onChange={handleInputChange} />
          <InputField label="Position" id="position" value={formData.position} onChange={handleInputChange} />
          <InputField label="Email" id="email" value={formData.email} onChange={handleInputChange} type="email" />
          <InputField label="Phone" id="phone" value={formData.phone} onChange={handleInputChange} />
          <InputField label="Department" id="department" value={formData.department} onChange={handleInputChange} />
          <InputField label="Joining Date" id="joiningdate" value={formData.joiningdate} onChange={handleInputChange} type="date" />
          <InputField label="Address" id="address" value={formData.address} onChange={handleInputChange} />
          <TextAreaField label="Bio" id="bio" value={formData.bio} onChange={handleInputChange} />
          <FileInputField label="Profile Photo" id="photo" onChange={handleFileChange} />
          <PasswordInputField label="Password" id="password" value={formData.password} onChange={handleInputChange} />

          <div className="profile-buttons">
            <button type="button" onClick={handleSave}><FaSave /> Save</button>
            <button type="button" onClick={() => setIsEditing(false)}><FaTimes /> Cancel</button>
          </div>
        </form>
      ) : (
        <ProfileDetails profile={profile} parseDate={parseDate} />
      )}
    </div>
  );
}

function InputField({ label, id, value, onChange, type = "text" }) {
  return (
    <div className="profile-item">
      <label htmlFor={id}>{label}:</label>
      <input type={type} id={id} name={id} value={value || ''} onChange={onChange} />
    </div>
  );
}

function TextAreaField({ label, id, value, onChange }) {
  return (
    <div className="profile-item">
      <label htmlFor={id}>{label}:</label>
      <textarea id={id} name={id} value={value || ''} onChange={onChange} />
    </div>
  );
}

function FileInputField({ label, id, onChange }) {
  return (
    <div className="profile-item">
      <label htmlFor={id}>{label}:</label>
      <input type="file" id={id} name={id} onChange={onChange} />
    </div>
  );
}

function PasswordInputField({ label, id, value, onChange }) {
  return (
    <div className="profile-item">
      <label htmlFor={id}>{label}:</label>
      <input type="password" id={id} name={id} value={value || ''} onChange={onChange} />
    </div>
  );
}

function ProfileDetails({ profile, parseDate }) {
  return (
    <div className="profile-details">
      <ProfileItem label="Position" value={profile.position} />
      <ProfileItem label="Email" value={profile.email} />
      <ProfileItem label="Phone" value={profile.phone} />
      <ProfileItem label="Department" value={profile.department} />
      <ProfileItem label="Joining Date" value={parseDate(profile.joiningdate)} />
      <ProfileItem label="Address" value={profile.address} />
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <strong>{label}:</strong> <span>{value}</span>
    </div>
  );
}

export default Profile;
