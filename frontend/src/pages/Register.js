import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const additionalData = {};
      if (formData.role === 'student') {
        additionalData.phone = formData.phone;
        additionalData.address = formData.address;
      } else if (formData.role === 'institution') {
        additionalData.location = formData.address;
        additionalData.type = 'university';
      } else if (formData.role === 'company') {
        additionalData.industry = formData.phone;
        additionalData.location = formData.address;
      }

      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        additionalData
      });

      // In development, skip verification and go directly to dashboard
      if (process.env.NODE_ENV === 'development' || result.user.isVerified) {
        // Redirect to appropriate dashboard based on role
        const userRole = result.user?.role;
        if (userRole === 'student') {
          navigate('/student/dashboard');
        } else if (userRole === 'institution') {
          navigate('/institution/dashboard');
        } else if (userRole === 'company') {
          navigate('/company/dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setVerificationStep(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyEmail(formData.email, verificationCode);
      // Redirect to appropriate dashboard based on role
      const userRole = result.user?.role || formData.role;
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'institution') {
        navigate('/institution/dashboard');
      } else if (userRole === 'company') {
        navigate('/company/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Development bypass - auto verify and login
  const handleDevBypass = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/dev-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Now try to login with the same credentials
        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          additionalData: {}
        });
        // Redirect to appropriate dashboard
        const userRole = result.user?.role || formData.role;
        if (userRole === 'student') {
          navigate('/student/dashboard');
        } else if (userRole === 'institution') {
          navigate('/institution/dashboard');
        } else if (userRole === 'company') {
          navigate('/company/dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Development verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-container">
            <Card title="Verify Your Email" className="auth-card">
              <p>Please check your email for the verification code.</p>
              
              <div className="verification-help">
                <p><strong>Development Note:</strong> In development mode, emails are not actually sent.</p>
                <p>Check your server console for the verification code, or use the button below to bypass verification.</p>
              </div>

              <form onSubmit={handleVerification} className="auth-form">
                <div className="form-group">
                  <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="form-control"
                    required
                    placeholder="Enter verification code from server console"
                  />
                </div>

                <div className="verification-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-full"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  
                  <button 
                    type="button"
                    className="btn btn-outline btn-full"
                    onClick={handleDevBypass}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Development Bypass'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <Card title="Create Your Account" className="auth-card">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  required
                  minLength="6"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Account Type</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="student">Student</option>
                  <option value="institution">Institution</option>
                  <option value="company">Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>
                </>
              )}

              {formData.role === 'institution' && (
                <div className="form-group">
                  <label htmlFor="address" className="form-label">Location</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter institution location"
                  />
                </div>
              )}

              {formData.role === 'company' && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Industry</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter company industry"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Location</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter company location"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-links">
              <p>
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </div>

            <div className="auth-info">
              <h4>Development Mode</h4>
              <div className="demo-accounts">
                <p>In development, accounts are auto-verified and can login immediately.</p>
                <p>Check server console for verification codes if needed.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;