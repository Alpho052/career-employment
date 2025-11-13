import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const data = await adminAPI.getCompanies(status);
      setCompanies(data.companies || []);
    } catch (error) {
      setMessage('Error fetching companies: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId, newStatus) => {
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.updateCompanyStatus(companyId, newStatus);
      await fetchCompanies();
      setMessage('Company status updated successfully.');
    } catch (error) {
      setMessage('Error updating company: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also delete all associated jobs.')) {
      return;
    }
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.deleteCompany(companyId);
      await fetchCompanies();
      setMessage('Company deleted successfully.');
    } catch (error) {
      setMessage('Error deleting company: ' + (error.message || error));
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
    return <LoadingSpinner text="Loading companies..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Companies</h1>
          <p>Review and manage company accounts</p>
        </div>

        <Card title="Companies">
          <div className="filter-section" style={{ marginBottom: '20px' }}>
            <label>Filter by status:</label>
            <select 
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginLeft: '10px', display: 'inline-block', width: 'auto' }}
            >
              <option value="all">All Companies</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}

          {companies.length === 0 ? (
            <div className="no-companies">
              <h3>No companies found</h3>
              <p>There are no companies matching your current filter.</p>
            </div>
          ) : (
            <div className="companies-list">
              {companies.map(company => (
                <Card key={company.id} className="company-card">
                  <div className="company-header">
                    <div className="company-info">
                      <h4>{company.name}</h4>
                      <p>Email: {company.email}</p>
                      <p>Industry: {company.industry || 'Not specified'}</p>
                    </div>
                    <div className="company-status">
                      <span className={`status ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </div>
                  </div>

                  <div className="company-actions">
                    {company.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateCompanyStatus(company.id, 'approved')}
                          disabled={updating}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => updateCompanyStatus(company.id, 'rejected')}
                          disabled={updating}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {company.status === 'approved' && (
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => updateCompanyStatus(company.id, 'suspended')}
                        disabled={updating}
                      >
                        Suspend
                      </button>
                    )}
                    {company.status === 'suspended' && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => updateCompanyStatus(company.id, 'approved')}
                        disabled={updating}
                      >
                        Reactivate
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteCompany(company.id)}
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

export default ManageCompanies;
