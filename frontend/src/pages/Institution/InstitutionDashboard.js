import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InstitutionDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, coursesData, applicationsData] = await Promise.all([
          institutionAPI.getProfile(),
          institutionAPI.getCourses(),
          institutionAPI.getApplications()
        ]);
        
        setProfile(profileData.institution);
        setStats({
          coursesCount: coursesData.courses?.length || 0,
          applicationsCount: applicationsData.applications?.length || 0,
          pendingApplications: applicationsData.applications?.filter(app => app.status === 'pending').length || 0
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
          <h1>Institution Dashboard</h1>
          <p>Welcome back, {profile?.name}</p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <h3>Total Courses</h3>
            <div className="dashboard-stats">{stats.coursesCount}</div>
            <p>Courses Offered</p>
            <Link to="/institution/courses" className="btn btn-outline btn-small">
              Manage Courses
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Applications</h3>
            <div className="dashboard-stats">{stats.applicationsCount}</div>
            <p>Total Applications Received</p>
            <Link to="/institution/applications" className="btn btn-outline btn-small">
              View Applications
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Pending Review</h3>
            <div className="dashboard-stats">{stats.pendingApplications}</div>
            <p>Applications Awaiting Decision</p>
            <Link to="/institution/applications?status=pending" className="btn btn-outline btn-small">
              Review Now
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Admissions Status</h3>
            <div className={`dashboard-stats ${profile?.admissionsOpen ? 'status-success' : 'status-warning'}`}>
              {profile?.admissionsOpen ? 'Open' : 'Closed'}
            </div>
            <p>{profile?.nextIntakeDate ? `Next intake: ${profile.nextIntakeDate}` : 'Update your next intake date'}</p>
            <Link to="/institution/admissions" className="btn btn-outline btn-small">
              Manage Admissions
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Institution Profile</h3>
            <div className="dashboard-stats">⭐</div>
            <p>Manage your institution information</p>
            <Link to="/institution/profile" className="btn btn-outline btn-small">
              Update Profile
            </Link>
          </Card>
        </div>

        <div className="dashboard-actions">
          <Link to="/institution/courses" className="btn btn-primary">
            Add New Course
          </Link>
          <Link to="/institution/faculties" className="btn btn-secondary">
            Manage Faculties
          </Link>
          <Link to="/institution/applications" className="btn btn-secondary">
            Review Applications
          </Link>
          <Link to="/institution/admissions" className="btn btn-outline">
            Admissions Settings
          </Link>
          <Link to="/institution/profile" className="btn btn-outline">
            Update Institution Info
          </Link>
        </div>

        <Card title="Quick Actions" className="quick-actions">
          <div className="actions-grid">
            <div className="action-item">
              <h4>Course Management</h4>
              <p>Add, edit, or remove courses from your institution</p>
              <Link to="/institution/courses" className="btn btn-outline btn-small">
                Manage Courses
              </Link>
            </div>
            <div className="action-item">
              <h4>Student Applications</h4>
              <p>Review and make decisions on student applications</p>
              <Link to="/institution/applications" className="btn btn-outline btn-small">
                View Applications
              </Link>
            </div>
            <div className="action-item">
              <h4>Faculties & Departments</h4>
              <p>Create and manage faculties for better course organisation</p>
              <Link to="/institution/faculties" className="btn btn-outline btn-small">
                Manage Faculties
              </Link>
            </div>
            <div className="action-item">
              <h4>Admissions Settings</h4>
              <p>Control admissions status and publish intake information</p>
              <Link to="/institution/admissions" className="btn btn-outline btn-small">
                Admissions Settings
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionDashboard;