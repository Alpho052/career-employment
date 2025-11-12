import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, profileData, documentsData, appliedIdsData, savedIdsData] = await Promise.all([
          studentAPI.getAvailableJobs(),
          studentAPI.getProfile(),
          studentAPI.getDocuments(),
          studentAPI.getJobApplicationIds(),
          studentAPI.getSavedJobIds()
        ]);
        
        setJobs(jobsData.jobs || []);
        setProfile(profileData.student);
        setCertificates((documentsData.documents || []).filter(doc => ['certificate', 'diploma'].includes((doc.documentType || '').toLowerCase())));
        setAppliedJobIds(appliedIdsData.jobIds || []);
        setSavedJobIds(savedIdsData.jobIds || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const meetsRequirements = (job) => {
    if (!profile) return false;

    const gpa = parseFloat(profile.gpa || 0);
    if (job.minGPA && gpa < job.minGPA) {
      return false;
    }

    const totalExperienceYears = Array.isArray(profile.experience)
      ? profile.experience.reduce((sum, exp) => sum + (Number(exp.years) || 0), 0)
      : 0;
    if (job.minExperienceYears && totalExperienceYears < job.minExperienceYears) {
      return false;
    }

    const requiredCertificates = Array.isArray(job.requirements?.requiredCertificates)
      ? job.requirements.requiredCertificates
      : [];
    if (requiredCertificates.length > 0) {
      const studentCerts = certificates.map(cert => cert.fileName.toLowerCase());
      const missingCertificate = requiredCertificates.some(required =>
        !studentCerts.some(studentCert => studentCert.includes(required.toLowerCase()))
      );
      if (missingCertificate) {
        return false;
      }
    }

    const keywords = Array.isArray(job.requirements?.keywords)
      ? job.requirements.keywords.map(keyword => keyword.toLowerCase())
      : [];
    if (keywords.length > 0) {
      const skillsText = [
        profile.skills || '',
        ...(Array.isArray(profile.experience)
          ? profile.experience.map(exp => `${exp.role || ''} ${exp.description || ''}`)
          : [])
      ].join(' ').toLowerCase();

      const missingKeyword = keywords.some(keyword => !skillsText.includes(keyword));
      if (missingKeyword) {
        return false;
      }
    }

    return true;
  };

  const applyToJob = async (jobId) => {
    try {
      await studentAPI.applyForJob(jobId);
      setAppliedJobIds([...new Set([...appliedJobIds, jobId])]);
    } catch (e) {
      console.error('Apply job failed:', e);
    }
  };

  const saveJob = async (jobId) => {
    try {
      await studentAPI.saveJob(jobId);
      setSavedJobIds([...new Set([...savedJobIds, jobId])]);
    } catch (e) {
      console.error('Save job failed:', e);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job opportunities..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Job Opportunities</h1>
          <p>Find jobs that match your qualifications and interests</p>
        </div>

        <Card title="Available Jobs" className="jobs-container">
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <h3>No job opportunities available at the moment</h3>
              <p>Check back later for new job postings that match your profile.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => (
                <Card key={job.id} className={`job-card ${!meetsRequirements(job) ? 'job-ineligible' : ''}`}>
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span className="job-type">{job.type}</span>
                  </div>
                  
                  <div className="job-company">
                    <strong>{job.company?.name}</strong>
                    <span className="job-location">{job.location}</span>
                  </div>

                  <div className="job-description">
                    {job.description}
                  </div>

                  <div className="job-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      {job.minGPA && (
                        <li>Minimum GPA: {job.minGPA}</li>
                      )}
                      {job.minExperienceYears && (
                        <li>Minimum Experience: {job.minExperienceYears} year(s)</li>
                      )}
                      {job.requirements.education && (
                        <li>Education: {job.requirements.education}</li>
                      )}
                      {job.requirements.experience && (
                        <li>Experience: {job.requirements.experience}</li>
                      )}
                      {Array.isArray(job.requirements?.requiredCertificates) && job.requirements.requiredCertificates.length > 0 && (
                        <li>Certificates: {job.requirements.requiredCertificates.join(', ')}</li>
                      )}
                      {Array.isArray(job.requirements?.keywords) && job.requirements.keywords.length > 0 && (
                        <li>Key Skills: {job.requirements.keywords.join(', ')}</li>
                      )}
                    </ul>
                  </div>

                  <div className="job-salary">
                    <strong>Salary: {job.salary || 'Negotiable'}</strong>
                  </div>

                  {!meetsRequirements(job) && (
                    <div className="job-warning">
                      <small>You don't meet all requirements for this position</small>
                    </div>
                  )}

                  <div className="job-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      disabled={!meetsRequirements(job) || appliedJobIds.includes(job.id)}
                      onClick={() => applyToJob(job.id)}
                    >
                      {appliedJobIds.includes(job.id) ? 'Applied' : 'Apply Now'}
                    </button>
                    <button 
                      className="btn btn-outline btn-small"
                      disabled={savedJobIds.includes(job.id)}
                      onClick={() => saveJob(job.id)}
                    >
                      {savedJobIds.includes(job.id) ? 'Saved' : 'Save for Later'}
                    </button>
                    {!meetsRequirements(job) && (
                      <p className="job-warning">
                        You currently do not meet all the requirements for this role. Update your GPA, experience, or certificates to become eligible.
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card title="Job Search Tips" className="tips-card">
          <h4>Maximize Your Job Search</h4>
          <ul>
            <li>Keep your grades and profile updated</li>
            <li>Apply to jobs that match your qualifications</li>
            <li>Check back regularly for new opportunities</li>
            <li>Ensure your GPA meets the minimum requirements</li>
            <li>Consider both full-time and internship positions</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default JobApplications;