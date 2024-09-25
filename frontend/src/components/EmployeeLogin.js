import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import './EmployeeLogin.css'; // Import the CSS for styling

function EmployeeLogin({ setEmployee }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // New state for error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset the error state
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post('https://hr-management-ps0b.onrender.com/EmployeeLogin', { email, password });
      console.log('Response from server:', response);

      if (response.data.success) {
        console.log('Login successful:', response.data.employee);
        setEmployee(response.data.employee);
        localStorage.setItem('employee', JSON.stringify(response.data.employee)); // Persist data
        navigate('/employeedashboard');
      } else {
        console.warn('Login failed:', response.data.message);
        setError(response.data.message); // Show error message from response
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Employee Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && <div className="error-message">{error}</div>} {/* Display error */}
        </form>
        <p>Admin Login <Link to="/login">Admin Login</Link></p>
      </div>
    </div>
  );
}

export default EmployeeLogin;
