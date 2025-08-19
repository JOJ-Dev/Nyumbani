import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    password: '',
    password2: '',
    role: 'tenant' // default
  });
  
  const [status, setStatus] = useState({ error: null, success: false, loading: false });

  const { email, phone_number, password, password2, role } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      return setStatus(prev => ({ ...prev, error: "Passwords do not match" }));
    }

    setStatus(prev => ({ ...prev, loading: true, error: null }));

    const payload = {
      email,
      phone_number,
      password,
      password2,
      tenant: role === 'tenant',
      landlord: role === 'landlord'
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server did not return JSON. Raw: " + text.slice(0, 200));
      }

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      setStatus({ success: true, error: null, loading: false });
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        error: err.message,
        loading: false
      }));
    }
  };

  if (status.success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <h1>Registration Successful</h1>
              <p>Please check your email to verify your account.</p>
            </div>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
        
        <style jsx>{`
          .register-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
          }
          
          .register-container {
            width: 100%;
            max-width: 400px;
          }
          
          .register-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            padding: 2.5rem;
            text-align: center;
          }
          
          .register-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
          }
          
          .register-header p {
            color: var(--gray-600);
            margin-bottom: 2rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join thousands of landlords and tenants</p>
          </div>
          
          <form onSubmit={handleSubmit} className="register-form">
            {status.error && (
              <div className="error-message">
                {status.error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={phone_number}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                minLength="8"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password2" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={password2}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                minLength="8"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="role-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="role"
                    value="tenant"
                    checked={role === 'tenant'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">
                    <strong>Tenant</strong>
                    <span>Looking for a place to rent</span>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="role"
                    value="landlord"
                    checked={role === 'landlord'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">
                    <strong>Landlord</strong>
                    <span>Have properties to manage</span>
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary register-btn"
              disabled={status.loading}
            >
              {status.loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }
        
        .register-container {
          width: 100%;
          max-width: 450px;
        }
        
        .register-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .register-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        
        .register-header p {
          color: var(--gray-600);
        }
        
        .register-form {
          margin-bottom: 2rem;
        }
        
        .error-message {
          background: #fee;
          color: var(--error-color);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .register-btn {
          width: 100%;
          margin-top: 1rem;
        }
        
        .role-selector {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .radio-option:hover {
          border-color: var(--primary-color);
          background-color: var(--gray-50);
        }
        
        .radio-option input[type="radio"] {
          margin-right: 0.75rem;
        }
        
        .radio-label {
          display: flex;
          flex-direction: column;
        }
        
        .radio-label strong {
          font-weight: 600;
          color: var(--gray-900);
        }
        
        .radio-label span {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .register-footer {
          text-align: center;
          color: var(--gray-600);
        }
        
        .login-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
        }
        
        .login-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .register-card {
            padding: 2rem;
          }
          
          .register-header h1 {
            font-size: 1.75rem;
          }
          
          .role-selector {
            gap: 0.5rem;
          }
          
          .radio-option {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
