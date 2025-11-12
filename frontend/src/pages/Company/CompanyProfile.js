import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { formatFirebaseDate } from '../../utils/dateHelper';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    industry: '',
    location: '',
    description: '',
    website: '',
    contactEmail: '',
    phone: '',
    size: ''
  });

  // Using shared date formatter

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await companyAPI.getProfile();
        setProfile(data.company);
        setFormData({
          industry: data.company.industry || '',
          location: data.company.location || '',
          description: data.company.description || '',
          website: data.company.website || '',
          contactEmail: data.company.contactEmail || '',
          phone: data.company.phone || '',
          size: data.company.size || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await companyAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      const msg = (error && (error.error || error.message)) || 'Unknown error';
      setMessage('Error updating profile: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Company Profile</h1>
          <p>Manage your company information</p>
        </div>

        <div className="profile-layout">
          <Card title="Company Information">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile?.name || ''}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="form-control"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select
                    name="size"
                    className="form-control"
                    value={formData.size}
                    onChange={handleChange}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter company location"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter contact phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Enter public contact email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your company, culture, and values"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </Card>

          <Card title="Account Status" className="status-card">
            <div className="status-item">
              <strong>Email Verification:</strong>
              <span className={`status ${profile?.isVerified ? 'status-success' : 'status-warning'}`}>
                {profile?.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="status-item">
              <strong>Account Status:</strong>
              <span className="status status-success">Active</span>
            </div>
            <div className="status-item">
              <strong>Member Since:</strong>
              <span>{formatFirebaseDate(profile?.createdAt)}</span>
            </div>
            <div className="status-item">
              <strong>Jobs Posted:</strong>
              <span>{profile?.jobsCount || 0}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;