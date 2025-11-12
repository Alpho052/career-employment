import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <h3>Total Students</h3>
            <div className="dashboard-stats">{stats.totalStudents}</div>
            <p>Registered Students</p>
          </Card>

          <Card className="dashboard-card">
            <h3>Institutions</h3>
            <div className="dashboard-stats">{stats.totalInstitutions}</div>
            <p>Approved Institutions</p>
            <Link to="/admin/institutions" className="btn btn-outline btn-small">
              Manage
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Companies</h3>
            <div className="dashboard-stats">{stats.totalCompanies}</div>
            <p>Approved Companies</p>
            <Link to="/admin/companies" className="btn btn-outline btn-small">
              Manage
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Active Jobs</h3>
            <div className="dashboard-stats">{stats.activeJobs}</div>
            <p>Job Postings</p>
          </Card>

          <Card className="dashboard-card">
            <h3>Applications</h3>
            <div className="dashboard-stats">{stats.totalApplications}</div>
            <p>Course Applications</p>
          </Card>

          <Card className="dashboard-card">
            <h3>Pending Approvals</h3>
            <div className="dashboard-stats">{stats.pendingInstitutions + stats.pendingCompanies}</div>
            <p>Awaiting Review</p>
            <Link to="/admin/institutions?status=pending" className="btn btn-outline btn-small">
              Review
            </Link>
          </Card>
        </div>

        <div className="dashboard-actions">
          <Link to="/admin/institutions" className="btn btn-primary">
            Manage Institutions
          </Link>
          <Link to="/admin/companies" className="btn btn-secondary">
            Manage Companies
          </Link>
          <Link to="/admin/reports" className="btn btn-outline">
            System Reports
          </Link>
        </div>

        <Card title="Quick Stats" className="quick-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Pending Institutions:</strong> {stats.pendingInstitutions}
            </div>
            <div className="stat-item">
              <strong>Pending Companies:</strong> {stats.pendingCompanies}
            </div>
            <div className="stat-item">
              <strong>Total Users:</strong> {stats.totalStudents + stats.totalInstitutions + stats.totalCompanies}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;