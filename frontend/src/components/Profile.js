import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css'; 

function Profile({ employee }) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isJoiningDateEditable, setJoiningDateEditable] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
  const genders = ["Male", "Female", "Other"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${employee.id}`);
        setProfile(response.data);

        const departmentsResponse = await axios.get('http://localhost:5000/departments');
        setDepartments(departmentsResponse.data);

        const positionsResponse = await axios.get('http://localhost:5000/positions');
        setPositions(positionsResponse.data);

        if (response.data.joiningdate) {
          setJoiningDateEditable(false);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prevProfile) => ({ ...prevProfile, photo: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    Object.keys(profile).forEach((key) => {
      if (key === "photo" && typeof profile.photo !== "string") {
        formData.append(key, profile.photo);
      } else {
        formData.append(key, profile[key]);
      }
    });
  
    try {
      await axios.put(`http://localhost:5000/profile/${profile.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile updated successfully');
  
      const updatedProfile = await axios.get(`http://localhost:5000/profile/${profile.id}`);
      setProfile(updatedProfile.data);
      setPreviewImage(null);
  
      if (updatedProfile.data.joiningdate) {
        setJoiningDateEditable(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Network error or server issue';
      alert(`Failed to update profile: ${errorMessage}`);
      console.error('Error updating profile:', err);
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form className="enhanced-profile" onSubmit={handleFormSubmit}>
      <div className="profile-header">
        <div className="profile-photo">
          <img
            src={previewImage ? previewImage : (profile.photo ? `http://localhost:5000/${profile.photo}?${new Date().getTime()}` : '/default-profile.png')}
            alt="Employee"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
          <input type="file" name="photo" onChange={handleFileChange} />
        </div>

        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p>ID: {profile.id} - {profile.position}</p>
        </div>
        <div className="profile-actions">
          <button type="submit" className="btn btn-primary">Update</button>
        </div>
      </div>

      <div className="profile-details">
        <div className="row">
          <div className="column">
            <div className="detail-item">
              <label>Name:</label>
              <input type="text" name="name" value={profile.name || ''} disabled onChange={handleInputChange} />
            </div>
            <div className="detail-item">
              <label>Position:</label>
              <select name="position" value={profile.position || ''} onChange={handleInputChange}>
                <option value="">Select Position</option>
                {positions.map(position => (
                  <option key={position.id} value={position.name}>{position.name}</option>
                ))}
              </select>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <input type="email" name="email" value={profile.email || ''} disabled onChange={handleInputChange} />
            </div>
            <div className="detail-item">
              <label>Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={profile.password || ''}  // Ensure fallback for null/undefined
                  onChange={handleInputChange}
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{ position: 'absolute', right: '10px', top: '10%', cursor: 'pointer' }}>
                  {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="detail-item">
              <label>Department:</label>
              <select name="department" value={profile.department || ''} onChange={handleInputChange}>
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.name}>{department.name}</option>
                ))}
              </select>
            </div>
            <div className="detail-item">
              <label>Joining Date:</label>
              <input
                type="date"
                name="joiningdate"
                value={profile.joiningdate ? profile.joiningdate.split('T')[0] : ''}  // Ensure yyyy-mm-dd format
                onChange={handleInputChange}
                disabled={!isJoiningDateEditable}
              />
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <textarea name="address" value={profile.address || ''} onChange={handleInputChange} />
            </div>
            <div className="detail-item">
              <label>Marital Status:</label>
              <select name="maritalStatus" value={profile.maritalStatus || ''} onChange={handleInputChange}>
                <option value="">Select Marital Status</option>
                {maritalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="detail-item">
              <label>Gender:</label>
              <div className="gender-options">
                {genders.map((gender, idx) => (
                  <label key={idx}>
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={profile.gender === gender}  // Ensure correct gender is selected
                      onChange={handleInputChange}
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>
            <div className="detail-item">
              <label>Employment Status:</label>
              <input type="text" name="employmentStatus" value={profile.employmentStatus || ''} disabled onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Profile;
