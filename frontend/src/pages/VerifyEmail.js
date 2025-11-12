import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailForVerification = localStorage.getItem('emailForVerification');
    if (emailForVerification) {
      setEmail(emailForVerification);
    } else {
      // If no email is found, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, verificationCode);
      navigate('/'); // Redirect to home or dashboard after successful verification
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <Card title="Verify Your Email" className="auth-card">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <p className="text-center mb-4">
              Please check your email for the verification code.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="form-control"
                  required
                  placeholder="Enter your 6-digit code"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;