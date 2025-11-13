import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetchInstitutions();
  }, [filter]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const data = await adminAPI.getInstitutions(status);
      setInstitutions(data.institutions || []);
    } catch (error) {
      setMessage('Error fetching institutions: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const updateInstitutionStatus = async (institutionId, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateInstitutionStatus(institutionId, newStatus);
      await fetchInstitutions();
      setMessage('Institution status updated successfully');
    } catch (error) {
      setMessage('Error updating institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteInstitution = async (institutionId) => {
    if (!window.confirm('Are you sure you want to delete this institution? This will also delete all associated courses.')) {
      return;
    }
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.deleteInstitution(institutionId);
      setMessage('Institution deleted successfully');
      await fetchInstitutions();
    } catch (error) {
      setMessage('Error deleting institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-success';
      case 'pending': return 'status-warning';
      case 'suspended': return 'status-error';
      case 'rejected': return 'status-error';
      default: return 'status-info';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading institutions..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Institutions</h1>
          <p>Review and manage higher learning institutions</p>
        </div>

        <Card title="Institutions">
          <div className="filter-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <label>Filter by status:</label>
              <select 
                className="form-control"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginLeft: '10px', display: 'inline-block', width: 'auto' }}
              >
                <option value="all">All Institutions</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}

          {institutions.length === 0 ? (
            <div className="no-institutions">
              <h3>No institutions found</h3>
              <p>There are no institutions matching your current filter.</p>
            </div>
          ) : (
            <div className="institutions-list">
              {institutions.map(institution => (
                <Card key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <div className="institution-info">
                      <h4>{institution.name}</h4>
                      <p>Email: {institution.email}</p>
                      <p>Location: {institution.location || 'Not specified'}</p>
                    </div>
                    <div className="institution-status">
                      <span className={`status ${getStatusColor(institution.status)}`}>
                        {institution.status}
                      </span>
                    </div>
                  </div>

                  <div className="institution-actions">
                    {institution.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                          disabled={updating}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => updateInstitutionStatus(institution.id, 'rejected')}
                          disabled={updating}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {institution.status === 'approved' && (
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => updateInstitutionStatus(institution.id, 'suspended')}
                        disabled={updating}
                      >
                        Suspend
                      </button>
                    )}
                    {institution.status === 'suspended' && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                        disabled={updating}
                      >
                        Reactivate
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteInstitution(institution.id)}
                      disabled={updating}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ManageInstitutions;
