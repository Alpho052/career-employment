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
            <h3>Total Users</h3>
            <div className="dashboard-stats">{stats.totalUsers}</div>
            <Link to="/admin/users" className="btn btn-outline btn-small">
              Manage Users
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Institutions</h3>
            <div className="dashboard-stats">{stats.institutions}</div>
            <p>{stats.pendingInstitutions} pending</p>
            <Link to="/admin/institutions" className="btn btn-outline btn-small">
              Manage Institutions
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Companies</h3>
            <div className="dashboard-stats">{stats.companies}</div>
            <p>{stats.pendingCompanies} pending</p>
            <Link to="/admin/companies" className="btn btn-outline btn-small">
              Manage Companies
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Jobs</h3>
            <div className="dashboard-stats">{stats.jobs}</div>
            <Link to="/admin/jobs" className="btn btn-outline btn-small">
              Manage Jobs
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
          <Link to="/admin/users" className="btn btn-info">
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
