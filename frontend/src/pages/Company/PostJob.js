import React, { useState } from 'react';
import { companyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: {
      education: '',
      experience: '',
      skills: '',
      requiredCertificates: '',
      keywords: ''
    },
    minGPA: '',
    minExperienceYears: '',
    location: '',
    type: 'full-time',
    salary: '',
    applicationDeadline: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('requirements.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const requiredCertificates = formData.requirements.requiredCertificates
        ? formData.requirements.requiredCertificates.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      const keywords = formData.requirements.keywords
        ? formData.requirements.keywords.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        minGPA: formData.minGPA ? Number(formData.minGPA) : '',
        minExperienceYears: formData.minExperienceYears ? Number(formData.minExperienceYears) : '',
        requirements: {
          education: formData.requirements.education,
          experience: formData.requirements.experience,
          skills: formData.requirements.skills,
          requiredCertificates,
          keywords
        }
      };

      await companyAPI.postJob(payload);
      setMessage('Job posted successfully!');
      setTimeout(() => {
        navigate('/company/dashboard');
      }, 2000);
    } catch (error) {
      setMessage('Error posting job: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Post a Job</h1>
          <p>Create a new job posting to attract qualified candidates</p>
        </div>

        <Card title="Job Details">
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Software Engineer Intern"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
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
                  placeholder="e.g., Maseru, Lesotho or Remote"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary</label>
                <input
                  type="text"
                  name="salary"
                  className="form-control"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., M5,000 - M8,000 per month"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum GPA</label>
                <input
                  type="number"
                  name="minGPA"
                  className="form-control"
                  value={formData.minGPA}
                  onChange={handleChange}
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="e.g., 3.0 (optional)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  className="form-control"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Years of Experience</label>
                <input
                  type="number"
                  name="minExperienceYears"
                  className="form-control"
                  value={formData.minExperienceYears}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              />
            </div>

            <div className="requirements-section">
              <h4>Requirements</h4>
              
              <div className="form-group">
                <label className="form-label">Education</label>
                <input
                  type="text"
                  name="requirements.education"
                  className="form-control"
                  value={formData.requirements.education}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's in Computer Science or related field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <input
                  type="text"
                  name="requirements.experience"
                  className="form-control"
                  value={formData.requirements.experience}
                  onChange={handleChange}
                  placeholder="e.g., Previous internship experience preferred"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <textarea
                  name="requirements.skills"
                  className="form-control"
                  rows="3"
                  value={formData.requirements.skills}
                  onChange={handleChange}
                  placeholder="List required skills and technologies..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Certificates</label>
                <input
                  type="text"
                  name="requirements.requiredCertificates"
                  className="form-control"
                  value={formData.requirements.requiredCertificates}
                  onChange={handleChange}
                  placeholder="e.g., AWS Certified Cloud Practitioner, PMP"
                />
                <small className="form-helper">Separate multiple certificates with commas. Applicants must have all listed certificates.</small>
              </div>

              <div className="form-group">
                <label className="form-label">Keywords for Matching</label>
                <input
                  type="text"
                  name="requirements.keywords"
                  className="form-control"
                  value={formData.requirements.keywords}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Agile"
                />
                <small className="form-helper">Keywords help us match applicants whose skills and experience align with this job.</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Posting Job...' : 'Post Job'}
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate('/company/dashboard')}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>

        <Card title="Posting Tips" className="tips-card">
          <h4>Create an Effective Job Post</h4>
          <ul>
            <li>Be clear and specific about the role</li>
            <li>Highlight key responsibilities</li>
            <li>Set realistic qualification requirements</li>
            <li>Include information about your company culture</li>
            <li>Be transparent about salary and benefits</li>
            <li>Set a reasonable application deadline</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;