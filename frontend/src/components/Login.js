// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      if (response.data.success) {
        alert('Login successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', email);
        navigate('/dashboard');
      } else {
        alert('Login failed!');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert(error.response.data.message); // Shows specific error messages from server
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };
  

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/signup">Sign up here.</a></p>
    </div>
  );
}

export default Login;
