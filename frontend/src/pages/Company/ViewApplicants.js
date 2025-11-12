import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatFirebaseDate } from '../../utils/dateHelper';

const ViewApplicants = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await companyAPI.getJobs();
        setJobs(data.jobs || []);
        if (data.jobs && data.jobs.length > 0) {
          setSelectedJob(data.jobs[0].id);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicants(selectedJob);
    }
  }, [selectedJob]);

  const fetchApplicants = async (jobId) => {
    setApplicantsLoading(true);
    try {
      const data = await companyAPI.getJobApplicants(jobId);
      setApplicants(data.applicants || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setApplicantsLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your jobs..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>View Applicants</h1>
          <p>Review applicants for your job postings</p>
        </div>

        <Card title="Select Job">
          <div className="form-group">
            <label className="form-label">Choose Job Posting</label>
            <select
              className="form-control"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">Select a job</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.applicantCount || 0} applicants)
                </option>
              ))}
            </select>
          </div>
        </Card>

        {selectedJob && (
          <Card title="Applicants">
            {applicantsLoading ? (
              <LoadingSpinner text="Loading applicants..." />
            ) : applicants.length === 0 ? (
              <div className="no-applicants">
                <h3>No interview-ready applicants yet</h3>
                <p>
                  We haven't found any candidates who meet all of your criteria. Encourage applicants to update their
                  profiles with relevant certificates and experience.
                </p>
              </div>
            ) : (
              <div className="applicants-list">
                {applicants.map(applicant => (
                  <Card key={applicant.id} className="applicant-card">
                    <div className="applicant-header">
                      <div className="applicant-info">
                        <h4>{applicant.student?.name}</h4>
                        <p>GPA: {applicant.student?.gpa || 'Not provided'}</p>
                        <p>Email: {applicant.student?.email}</p>
                        {applicant.student?.experience && applicant.student.experience.length > 0 && (
                          <p>Experience: {applicant.student.experience.reduce((sum, exp) => sum + (Number(exp.years) || 0), 0)} years</p>
                        )}
                      </div>
                      <div className="applicant-status">
                        <span className="status status-success">Ready for Interview</span>
                      </div>
                    </div>

                    <div className="applicant-details">
                      {applicant.student?.highSchool && (
                        <p><strong>Education:</strong> {applicant.student.highSchool}</p>
                      )}
                      {applicant.student?.phone && (
                        <p><strong>Phone:</strong> {applicant.student.phone}</p>
                      )}
                      <p><strong>Applied on:</strong> {formatFirebaseDate(applicant.appliedAt)}</p>
                      {Array.isArray(applicant.student?.certificates) && applicant.student.certificates.length > 0 && (
                        <p><strong>Certificates:</strong> {applicant.student.certificates.map(cert => cert.fileName).join(', ')}</p>
                      )}
                      {applicant.evaluation && (
                        <div className="evaluation-summary">
                          <h4>Match Summary</h4>
                          <ul>
                            <li>GPA: {applicant.evaluation.gpa} {applicant.evaluation.minGPA ? `(min ${applicant.evaluation.minGPA})` : ''}</li>
                            <li>Experience: {applicant.evaluation.totalExperienceYears} years {applicant.evaluation.minExperienceYears ? `(min ${applicant.evaluation.minExperienceYears})` : ''}</li>
                            {applicant.evaluation.requiredCertificates && applicant.evaluation.requiredCertificates.length > 0 && (
                              <li>Certificates matched: {applicant.evaluation.requiredCertificates.join(', ')}</li>
                            )}
                            {applicant.evaluation.keywords && applicant.evaluation.keywords.length > 0 && (
                              <li>Keyword match: {applicant.evaluation.keywords.join(', ')}</li>
                            )}
                            <li>Overall score: {applicant.evaluation.score}</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="applicant-actions">
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => { setSelectedApplicant(applicant); setShowApplicantModal(true); }}
                      >
                        View Full Profile
                      </button>
                      {applicant.student?.email && (
                        <a className="btn btn-success btn-small" href={`mailto:${applicant.student.email}`}>
                          Contact for Interview
                        </a>
                      )}
                      {applicant.student?.resumeUrl && (
                        <a className="btn btn-outline btn-small" href={applicant.student.resumeUrl} target="_blank" rel="noreferrer">
                          Download Resume
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        <Modal
          isOpen={showApplicantModal}
          onClose={() => setShowApplicantModal(false)}
          title={selectedApplicant?.student?.name || 'Applicant Profile'}
        >
          {selectedApplicant && (
            <div>
              <p><strong>Email:</strong> {selectedApplicant.student?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedApplicant.student?.phone || 'N/A'}</p>
              <p><strong>GPA:</strong> {selectedApplicant.student?.gpa || 'N/A'}</p>
              {selectedApplicant.student?.highSchool && (
                <p><strong>High School:</strong> {selectedApplicant.student.highSchool}</p>
              )}
              {Array.isArray(selectedApplicant.student?.grades) && selectedApplicant.student.grades.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Grades:</strong>
                  <ul>
                    {selectedApplicant.student.grades.map((g, idx) => (
                      <li key={idx}>{g.subject}: {g.grade}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(selectedApplicant.student?.experience) && selectedApplicant.student.experience.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Experience:</strong>
                  <ul>
                    {selectedApplicant.student.experience.map((exp, idx) => (
                      <li key={idx}>
                        <strong>{exp.role || 'Role not specified'}</strong>
                        {exp.company && ` at ${exp.company}`} - {exp.years || 0} year(s)
                        {exp.description && ` – ${exp.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(selectedApplicant.student?.certificates) && selectedApplicant.student.certificates.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Certificates:</strong>
                  <ul>
                    {selectedApplicant.student.certificates.map(cert => (
                      <li key={cert.id}>{cert.fileName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Card title="Applicant Evaluation" className="evaluation-guide">
          <h4>How to Evaluate Applicants</h4>
          <ul>
            <li>Review their GPA and academic performance</li>
            <li>Check if they meet your job requirements</li>
            <li>Look for relevant skills and experience</li>
            <li>Consider their communication skills</li>
            <li>Evaluate their fit with your company culture</li>
            <li>Respond to all applicants in a timely manner</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ViewApplicants;