import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faUser, faLock, faUserShield } from '@fortawesome/free-solid-svg-icons'; // Import icons

axios.defaults.baseURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL; // Set base URL

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // Default role is 'employee'
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting:', { username, password, role });

    try {
      const response = await axios.post('/api/login', { username, password, role });
      console.log('Server response:', response.data);

      if (response.status === 200) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate based on role
        if (userData.role === 'admin') {
          navigate('/AdminDashboard'); // Admin dashboard
        } else if (userData.role === 'employee') {
          navigate('/EmpDashboard'); // Employee dashboard
        } else {
          throw new Error('Invalid role');
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error Response:', error.response); // Log server response
      setError(error.response?.data?.message || 'Unable to connect to the server.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark">
      <div
        className={`card p-4 shadow-lg ${shake ? 'animate-shake' : ''}`}
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <div className="text-center mb-4">
          <img
            src="/logodept.png"
            alt="Logo"
            className="img-fluid"
            style={{ maxHeight: '137px' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          {/* Username Input with Floating Label and Icon */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Username
            </label>
          </div>

          {/* Password Input with Floating Label and Icon */}
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} className="me-2" />
              Password
            </label>
          </div>

          {/* Role Selection with Floating Label and Icon */}
          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
            <label htmlFor="role">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              Role
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Error Message */}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
      </div>
      {/* Footer */}
      <footer className="text-white mt-4 text-center">
        All rights reserved. Powered by Supplies Office Department Intern.
      </footer>
    </div>
  );
};

export default LoginForm;
