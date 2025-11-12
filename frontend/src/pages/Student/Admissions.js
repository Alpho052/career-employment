import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const Admissions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await studentAPI.getApplications();
        setApplications(data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'status-success';
      case 'accepted': return 'status-success';
      case 'rejected': return 'status-error';
      case 'declined': return 'status-error';
      case 'waiting-list': return 'status-warning';
      default: return 'status-info';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'admitted': return 'Admitted 🎉';
      case 'accepted': return 'Accepted ✅';
      case 'rejected': return 'Not Admitted';
      case 'declined': return 'Declined';
      case 'waiting-list': return 'Waiting List';
      case 'pending': return 'Under Review';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admission status..." />;
  }

  const admittedApplications = applications.filter(app => app.status === 'admitted');
  const otherApplications = applications.filter(app => app.status !== 'admitted');

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admission Status</h1>
          <p>Track your course application results</p>
        </div>

        {admittedApplications.length > 0 && (
          <Card title="🎉 Admission Offers" className="admission-offers">
            <h3>Congratulations! You've been admitted to the following programs:</h3>
            <div className="admitted-list">
              {admittedApplications.map(application => (
                <div key={application.id} className="admitted-item">
                  <div className="admitted-info">
                    <h4>{application.course?.name || 'Unknown Course'}</h4>
                    <p>at {application.institution?.name || 'Unknown Institution'}</p>
                  </div>
                  <div className="admitted-actions">
                    <button
                      className="btn btn-success"
                      onClick={async () => {
                        try {
                          await studentAPI.decideOnOffer(application.id, 'accept');
                          const data = await studentAPI.getApplications();
                          setApplications(data.applications || []);
                        } catch (e) {
                          console.error('Accept offer failed:', e);
                        }
                      }}
                    >
                      Accept Offer
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={async () => {
                        try {
                          await studentAPI.decideOnOffer(application.id, 'decline');
                          const data = await studentAPI.getApplications();
                          setApplications(data.applications || []);
                        } catch (e) {
                          console.error('Decline offer failed:', e);
                        }
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="All Applications" className="all-applications">
          {applications.length === 0 ? (
            <div className="no-applications">
              <h3>No applications submitted yet</h3>
              <p>Start by applying to courses from the application page.</p>
            </div>
          ) : (
            <div className="applications-table">
              {otherApplications.map(application => (
                <div key={application.id} className="application-row">
                  <div className="application-details">
                    <h4>{application.course?.name || 'Unknown Course'}</h4>
                    <p className="institution-name">
                      {application.institution?.name || 'Unknown Institution'}
                    </p>
                    <p className="application-date">
                      Applied: {formatFirebaseDate(application.appliedAt)}
                    </p>
                  </div>
                  <div className="application-status">
                    <span className={`status ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Admission Timeline" className="timeline-card">
          <h4>What to Expect</h4>
          <div className="timeline">
            <div className="timeline-item">
              <strong>Application Submitted</strong>
              <p>Your application is received and under review</p>
            </div>
            <div className="timeline-item">
              <strong>Under Review</strong>
              <p>Institution reviews your application and grades</p>
            </div>
            <div className="timeline-item">
              <strong>Decision Made</strong>
              <p>Admission decision is communicated to you</p>
            </div>
            <div className="timeline-item">
              <strong>Acceptance</strong>
              <p>You can accept or decline admission offers</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admissions;