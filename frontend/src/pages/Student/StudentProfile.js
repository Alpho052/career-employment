import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documentType: 'additional',
    fileName: '',
    fileUrl: '',
    description: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    dateOfBirth: '',
    highSchool: '',
    graduationYear: '',
    skills: ''
  });
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileData, documentsData] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getDocuments()
        ]);
        console.log('Profile data:', profileData); // Debug log
        setProfile(profileData.student);
        setFormData({
          phone: profileData.student.phone || '',
          address: profileData.student.address || '',
          dateOfBirth: profileData.student.dateOfBirth || '',
          highSchool: profileData.student.highSchool || '',
          graduationYear: profileData.student.graduationYear || '',
          skills: profileData.student.skills || ''
        });
        setExperience(Array.isArray(profileData.student.experience) ? profileData.student.experience : []);
        setDocuments(documentsData.documents || []);
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

  const addExperienceEntry = () => {
    setExperience([
      ...experience,
      { company: '', role: '', years: '', description: '' }
    ]);
  };

  const updateExperienceEntry = (index, field, value) => {
    const updated = [...experience];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setExperience(updated);
  };

  const removeExperienceEntry = (index) => {
    const updated = experience.filter((_, idx) => idx !== index);
    setExperience(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await studentAPI.updateProfile({
        ...formData,
        experience: experience.map(exp => ({
          company: exp.company || '',
          role: exp.role || '',
          years: exp.years || '',
          description: exp.description || ''
        }))
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, you would upload to Firebase Storage or another service
      // For now, we'll just store the file name and let the user provide a URL
      setDocumentForm({
        ...documentForm,
        fileName: file.name,
        fileUrl: '' // User can provide URL manually or integrate with file storage
      });
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!documentForm.fileName) {
      setMessage('Please select a file or enter a file name');
      return;
    }

    setUploadingDoc(true);
    setMessage('');

    try {
      await studentAPI.uploadDocument(documentForm);
      setMessage('Document uploaded successfully!');
      setShowDocumentModal(false);
      setDocumentForm({
        documentType: 'additional',
        fileName: '',
        fileUrl: '',
        description: ''
      });
      
      // Refresh documents
      const documentsData = await studentAPI.getDocuments();
      setDocuments(documentsData.documents || []);
    } catch (error) {
      setMessage('Error uploading document: ' + error.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await studentAPI.deleteDocument(documentId);
      setMessage('Document deleted successfully');
      const documentsData = await studentAPI.getDocuments();
      setDocuments(documentsData.documents || []);
    } catch (error) {
      setMessage('Error deleting document: ' + error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Student Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div className="profile-layout">
          <Card title="Personal Information">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
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
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">High School</label>
                  <input
                    type="text"
                    name="highSchool"
                    className="form-control"
                    value={formData.highSchool}
                    onChange={handleChange}
                    placeholder="Enter your high school name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    className="form-control"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="2024"
                    min="2000"
                    max="2030"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills & Competencies</label>
                <textarea
                  name="skills"
                  className="form-control"
                  rows="3"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="List your key skills, separated by commas (e.g., JavaScript, Project Management, Leadership)"
                />
                <small className="form-helper">Provide a quick overview of your skills to help companies assess your profile.</small>
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
              <strong>Student ID:</strong>
              <span>{profile?.uid ? profile.uid.substring(0, 8) + '...' : 'N/A'}</span>
            </div>
          </Card>

          <Card title="Work Experience" className="experience-card">
            {experience.length === 0 && (
              <p>You have not added any work experience yet.</p>
            )}

            {experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role / Position</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exp.role}
                      onChange={(e) => updateExperienceEntry(index, 'role', e.target.value)}
                      placeholder="e.g., Intern Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organisation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exp.company}
                      onChange={(e) => updateExperienceEntry(index, 'company', e.target.value)}
                      placeholder="e.g., ABC Tech Solutions"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      className="form-control"
                      value={exp.years}
                      onChange={(e) => updateExperienceEntry(index, 'years', e.target.value)}
                      min="0"
                      step="0.5"
                      placeholder="e.g., 1.5"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Responsibilities / Achievements</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={exp.description}
                      onChange={(e) => updateExperienceEntry(index, 'description', e.target.value)}
                      placeholder="Briefly describe your duties and accomplishments"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => removeExperienceEntry(index)}
                >
                  Remove Experience
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline"
              onClick={addExperienceEntry}
            >
              Add Work Experience
            </button>
            <p className="form-helper" style={{ marginTop: '10px' }}>
              Adding your work experience helps companies identify interview-ready candidates.
            </p>
          </Card>

          <Card title="Documents" className="documents-card">
            <div style={{ marginBottom: '15px' }}>
              <button 
                className="btn btn-primary btn-small"
                onClick={() => {
                  setShowDocumentModal(true);
                  setMessage('');
                  setDocumentForm({
                    documentType: 'additional',
                    fileName: '',
                    fileUrl: '',
                    description: ''
                  });
                }}
              >
                Upload Document
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>Additional Documents</h4>
              {documents.filter(d => d.documentType === 'additional').length === 0 ? (
                <p>No additional documents uploaded yet.</p>
              ) : (
                <div className="documents-list">
                  {documents.filter(d => d.documentType === 'additional').map(doc => (
                    <div key={doc.id} className="document-item" style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{doc.fileName}</strong>
                        {doc.description && <p style={{ margin: '5px 0', color: '#666' }}>{doc.description}</p>}
                        <small>Uploaded: {formatFirebaseDate(doc.uploadedAt)}</small>
                      </div>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4>Academic Transcripts & Certificates</h4>
              {documents.filter(d => ['transcript', 'certificate', 'diploma'].includes(d.documentType)).length === 0 ? (
                <p>No transcripts or certificates uploaded yet.</p>
              ) : (
                <div className="documents-list">
                  {documents.filter(d => ['transcript', 'certificate', 'diploma'].includes(d.documentType)).map(doc => (
                    <div key={doc.id} className="document-item" style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{doc.fileName}</strong>
                        <span className="badge" style={{ marginLeft: '10px' }}>{doc.documentType}</span>
                        {doc.description && <p style={{ margin: '5px 0', color: '#666' }}>{doc.description}</p>}
                        <small>Uploaded: {formatFirebaseDate(doc.uploadedAt)}</small>
                      </div>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
            <div className="modal modal-medium" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Upload Document</h3>
                <button className="modal-close" onClick={() => setShowDocumentModal(false)}>×</button>
              </div>
              <div className="modal-content">
                {message && (
                  <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                    {message}
                  </div>
                )}
                <form onSubmit={handleDocumentSubmit}>
                  <div className="form-group">
                    <label>Document Type *</label>
                    <select
                      className="form-control"
                      value={documentForm.documentType}
                      onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                      required
                    >
                      <option value="additional">Additional Document</option>
                      <option value="transcript">Academic Transcript</option>
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>File Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={documentForm.fileName}
                      onChange={(e) => setDocumentForm({ ...documentForm, fileName: e.target.value })}
                      placeholder="Enter file name"
                      required
                    />
                    <small>Or select a file:</small>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileSelect}
                      style={{ marginTop: '5px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>File URL (if uploaded to external storage)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={documentForm.fileUrl}
                      onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={documentForm.description}
                      onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                      rows="3"
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={uploadingDoc}>
                      {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowDocumentModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;