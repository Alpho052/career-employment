import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, jobsData] = await Promise.all([
          companyAPI.getProfile(),
          companyAPI.getJobs()
        ]);
        
        setProfile(profileData.company);
        
        const jobs = jobsData?.jobs || [];
        const totalApplicants = jobs.reduce((total, job) => total + (job.applicantCount || 0), 0);

        // Fallback to profile jobsCount if jobs list is unavailable/empty
        const jobsCount = jobs.length > 0 ? jobs.length : (profileData?.company?.jobsCount || 0);

        setStats({
          jobsCount,
          activeJobs: jobs.filter(job => job.status === 'active').length,
          totalApplicants: totalApplicants
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Company Dashboard</h1>
          <p>Welcome back, {profile?.name}</p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <h3>Active Jobs</h3>
            <div className="dashboard-stats">{stats.activeJobs}</div>
            <p>Job Postings Live</p>
            <Link to="/company/post-job" className="btn btn-outline btn-small">
              Post New Job
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Total Jobs</h3>
            <div className="dashboard-stats">{stats.jobsCount}</div>
            <p>All Job Postings</p>
            <Link to="/company/applicants" className="btn btn-outline btn-small">
              Manage Jobs
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Applicants</h3>
            <div className="dashboard-stats">{stats.totalApplicants}</div>
            <p>Total Applicants</p>
            <Link to="/company/applicants" className="btn btn-outline btn-small">
              View Applicants
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Company Profile</h3>
            <div className="dashboard-stats">🏢</div>
            <p>Manage company information</p>
            <Link to="/company/profile" className="btn btn-outline btn-small">
              Update Profile
            </Link>
          </Card>
        </div>

        <div className="dashboard-actions">
          <Link to="/company/post-job" className="btn btn-primary">
            Post New Job
          </Link>
          <Link to="/company/applicants" className="btn btn-secondary">
            View Applicants
          </Link>
          <Link to="/company/profile" className="btn btn-outline">
            Update Company Info
          </Link>
        </div>

        <Card title="Recruitment Tips" className="tips-card">
          <h4>Attract the Best Talent</h4>
          <ul>
            <li>Write clear and detailed job descriptions</li>
            <li>Set realistic GPA and qualification requirements</li>
            <li>Highlight company benefits and growth opportunities</li>
            <li>Respond to applicants in a timely manner</li>
            <li>Keep your company profile updated</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;