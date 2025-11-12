import React, { useState, useEffect } from 'react';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const data = await institutionAPI.getApplications(status);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdating(true);
    try {
      await institutionAPI.updateApplicationStatus(applicationId, newStatus);
      // Refresh applications
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'status-success';
      case 'rejected': return 'status-error';
      case 'waiting-list': return 'status-warning';
      default: return 'status-info';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading applications..." />;
  }

  const filteredApplications = applications;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Student Applications</h1>
          <p>Review and manage student applications</p>
        </div>

        <Card title="Applications">
          <div className="filter-section">
            <label>Filter by status:</label>
            <select 
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Not Admitted</option>
              <option value="waiting-list">Waiting List</option>
            </select>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <h3>No applications found</h3>
              <p>There are no applications matching your current filter.</p>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map(application => (
                <Card key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="student-info">
                      <h4>{application.student?.name}</h4>
                      <p>Applied to: {application.course?.name}</p>
                      <p>GPA: {application.student?.gpa || 'Not provided'}</p>
                    </div>
                    <div className="application-status">
                      <span className={`status ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <div className="application-details">
                    <p><strong>Email:</strong> {application.student?.email}</p>
                    <p><strong>Applied on:</strong> {formatFirebaseDate(application.appliedAt)}</p>
                    {application.student?.highSchool && (
                      <p><strong>High School:</strong> {application.student.highSchool}</p>
                    )}
                  </div>

                  <div className="application-actions">
                    {application.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateApplicationStatus(application.id, 'admitted')}
                          disabled={updating}
                        >
                          Admit Student
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          disabled={updating}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-warning btn-small"
                          onClick={() => updateApplicationStatus(application.id, 'waiting-list')}
                          disabled={updating}
                        >
                          Wait List
                        </button>
                      </>
                    )}
                    {application.status !== 'pending' && (
                      <span>Decision made</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card title="Admission Guidelines" className="guidelines-card">
          <h4>Review Process</h4>
          <ul>
            <li>Review each application carefully</li>
            <li>Consider the student's GPA and qualifications</li>
            <li>Check if they meet course requirements</li>
            <li>Make timely decisions to help students plan</li>
            <li>Use waiting list for borderline cases</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default StudentApplications;