import React, { useState, useEffect } from 'react';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const InstitutionProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    location: '',
    type: '',
    description: '',
    website: '',
    contactEmail: '',
    phone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await institutionAPI.getProfile();
        console.log('Institution profile data:', data); // Debug log
        setProfile(data.institution);
        setFormData({
          location: data.institution.location || '',
          type: data.institution.type || '',
          description: data.institution.description || '',
          website: data.institution.website || '',
          contactEmail: data.institution.contactEmail || '',
          phone: data.institution.phone || ''
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
      await institutionAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
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
          <h1>Institution Profile</h1>
          <p>Manage your institution information</p>
        </div>

        <div className="profile-layout">
          <Card title="Institution Information">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
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
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter institution location"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institution Type</label>
                  <select
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="institute">Institute</option>
                    <option value="polytechnic">Polytechnic</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
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
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your institution, programs, and facilities"
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
              <span className={`status ${profile?.status === 'approved' ? 'status-success' : 'status-warning'}`}>
                {profile?.status || 'Pending'}
              </span>
            </div>
            <div className="status-item">
              <strong>Member Since:</strong>
              <span>{formatFirebaseDate(profile?.createdAt)}</span>
            </div>
            <div className="status-item">
              <strong>Courses Offered:</strong>
              <span>{profile?.coursesCount || 0}</span>
            </div>
            <div className="status-item">
              <strong>Institution ID:</strong>
              <span>{profile?.uid ? profile.uid.substring(0, 8) + '...' : 'N/A'}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstitutionProfile;