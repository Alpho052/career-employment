import React, { useState, useEffect } from 'react';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const AdmissionsSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    admissionsOpen: false,
    admissionsMessage: '',
    nextIntakeDate: '',
    contactEmail: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await institutionAPI.getProfile();
        setProfile(data.institution);
        setFormData({
          admissionsOpen: data.institution?.admissionsOpen || false,
          admissionsMessage: data.institution?.admissionsMessage || '',
          nextIntakeDate: data.institution?.nextIntakeDate || '',
          contactEmail: data.institution?.admissionsContactEmail || data.institution?.contactEmail || ''
        });
      } catch (error) {
        console.error('Error loading admissions settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await institutionAPI.updateAdmissionsSettings({
        admissionsOpen: formData.admissionsOpen,
        admissionsMessage: formData.admissionsMessage,
        nextIntakeDate: formData.nextIntakeDate,
        contactEmail: formData.contactEmail
      });

      setMessage('Admissions settings updated successfully!');
    } catch (error) {
      setMessage('Error updating admissions settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admissions settings..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admissions Settings</h1>
          <p>Control when admissions are open and publish updates for prospective students</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="admissions-layout">
          <Card title="Admissions Status" className="admissions-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Admissions Status</label>
                <div className="toggle-group">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={formData.admissionsOpen}
                      onChange={(e) => setFormData({ ...formData, admissionsOpen: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                    <span className="toggle-label">{formData.admissionsOpen ? 'Open' : 'Closed'}</span>
                  </label>
                </div>
                <small className="form-helper">
                  When admissions are open, students can submit applications to your courses.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Admissions Announcement</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.admissionsMessage}
                  onChange={(e) => setFormData({ ...formData, admissionsMessage: e.target.value })}
                  placeholder="Share important information about your current admissions cycle"
                />
                <small className="form-helper">This message is shown to students viewing your institution.</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Next Intake / Semester</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nextIntakeDate}
                    onChange={(e) => setFormData({ ...formData, nextIntakeDate: e.target.value })}
                    placeholder="e.g., January 2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admissions Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admissions@example.com"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </Card>

          <Card title="Current Admissions Snapshot" className="snapshot-card">
            <div className="snapshot-item">
              <strong>Status:</strong> {formData.admissionsOpen ? 'Open for Applications' : 'Closed'}
            </div>
            <div className="snapshot-item">
              <strong>Next Intake:</strong> {formData.nextIntakeDate || 'Not set'}
            </div>
            <div className="snapshot-item">
              <strong>Contact Email:</strong> {formData.contactEmail || 'Not provided'}
            </div>
            <div className="snapshot-item">
              <strong>Last Updated:</strong> {formatFirebaseDate(profile?.updatedAt)}
            </div>
          </Card>
        </div>

        <Card title="Admissions Tips" className="guidelines-card">
          <ul>
            <li>Keep your admissions status updated to manage student expectations.</li>
            <li>Use the announcement to highlight important dates or requirements.</li>
            <li>Set a dedicated admissions contact email for quick responses.</li>
            <li>Update the next intake date as soon as new cycles are planned.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AdmissionsSettings;

