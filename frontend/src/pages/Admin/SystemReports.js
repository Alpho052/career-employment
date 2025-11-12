import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatFirebaseDate } from '../../utils/dateHelper';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const SystemReports = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdmissionsModal, setShowAdmissionsModal] = useState(false);
  const [admissionsAction, setAdmissionsAction] = useState('open');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [message, setMessage] = useState('');

  // Using shared date formatter

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData, institutionsData] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
          adminAPI.getInstitutions()
        ]);
        
        setStats(statsData.stats);
        setUsers(usersData.users || []);
        setInstitutions(institutionsData.institutions || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePublishAdmissions = async () => {
    setMessage('');
    try {
      await adminAPI.publishAdmissions(admissionsAction, selectedInstitutionId || undefined);
      setMessage(`Admissions ${admissionsAction === 'open' ? 'opened' : 'closed'} successfully`);
      setTimeout(() => {
        setShowAdmissionsModal(false);
        setAdmissionsAction('open');
        setSelectedInstitutionId('');
      }, 1500);
    } catch (error) {
      setMessage('Error publishing admissions: ' + (error.message || error));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading system reports..." />;
  }

  const userStats = {
    students: users.filter(u => u.role === 'student').length,
    institutions: users.filter(u => u.role === 'institution').length,
    companies: users.filter(u => u.role === 'company').length,
    verified: users.filter(u => u.isVerified).length,
    unverified: users.filter(u => !u.isVerified).length
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>System Reports</h1>
          <p>Platform analytics and user statistics</p>
        </div>

        <div className="reports-grid">
          <Card title="Platform Overview" className="overview-card">
            <div className="stats-grid">
              <div className="stat-item">
                <strong>Total Users:</strong>
                <span>{userStats.students + userStats.institutions + userStats.companies}</span>
              </div>
              <div className="stat-item">
                <strong>Students:</strong>
                <span>{userStats.students}</span>
              </div>
              <div className="stat-item">
                <strong>Institutions:</strong>
                <span>{userStats.institutions}</span>
              </div>
              <div className="stat-item">
                <strong>Companies:</strong>
                <span>{userStats.companies}</span>
              </div>
              <div className="stat-item">
                <strong>Verified Accounts:</strong>
                <span>{userStats.verified}</span>
              </div>
              <div className="stat-item">
                <strong>Pending Verification:</strong>
                <span>{userStats.unverified}</span>
              </div>
            </div>
          </Card>

          <Card title="Activity Metrics" className="metrics-card">
            <div className="metrics-grid">
              <div className="metric-item">
                <h3>{stats.totalApplications || 0}</h3>
                <p>Course Applications</p>
              </div>
              <div className="metric-item">
                <h3>{stats.activeJobs || 0}</h3>
                <p>Active Job Postings</p>
              </div>
              <div className="metric-item">
                <h3>{stats.pendingInstitutions || 0}</h3>
                <p>Pending Institutions</p>
              </div>
              <div className="metric-item">
                <h3>{stats.pendingCompanies || 0}</h3>
                <p>Pending Companies</p>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Recent User Registrations" className="users-card">
          <div className="users-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div>Registered</div>
            </div>
            {users.slice(0, 10).map(user => (
              <div key={user.id} className="table-row">
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>
                  <span className={`role role-${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <span className={`status ${user.isVerified ? 'status-success' : 'status-warning'}`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div>{formatFirebaseDate(user.createdAt)}</div>
              </div>
            ))}
          </div>
          {users.length === 0 && (
            <p>No users registered yet.</p>
          )}
        </Card>

        <Card title="Platform Health" className="health-card">
          <div className="health-status">
            <div className="health-item status-success">
              <strong>Backend API:</strong> Operational
            </div>
            <div className="health-item status-success">
              <strong>Database:</strong> Connected
            </div>
            <div className="health-item status-success">
              <strong>Authentication:</strong> Active
            </div>
            <div className="health-item status-success">
              <strong>Email Service:</strong> Configured
            </div>
          </div>
        </Card>

        <Card title="Admissions Management" className="admissions-card">
          <p>Publish and manage admission periods for institutions</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowAdmissionsModal(true);
              setMessage('');
              setAdmissionsAction('open');
              setSelectedInstitutionId('');
            }}
          >
            Manage Admissions
          </button>
        </Card>
      </div>

      {/* Admissions Modal */}
      <Modal isOpen={showAdmissionsModal} onClose={() => setShowAdmissionsModal(false)} title="Publish Admissions" size="medium">
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
            {message}
          </div>
        )}
        <div className="form-group">
          <label>Action *</label>
          <select
            className="form-control"
            value={admissionsAction}
            onChange={(e) => setAdmissionsAction(e.target.value)}
          >
            <option value="open">Open Admissions</option>
            <option value="close">Close Admissions</option>
          </select>
        </div>
        <div className="form-group">
          <label>Institution (Leave empty for all institutions)</label>
          <select
            className="form-control"
            value={selectedInstitutionId}
            onChange={(e) => setSelectedInstitutionId(e.target.value)}
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={handlePublishAdmissions}
          >
            {admissionsAction === 'open' ? 'Open' : 'Close'} Admissions
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowAdmissionsModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SystemReports;