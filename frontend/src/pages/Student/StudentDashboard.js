import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFirebaseDate } from '../../utils/dateHelper';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, applicationsData] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getApplications()
        ]);
        
        setProfile(profileData.student);
        setStats({
          applicationCount: applicationsData.applications?.length || 0,
          gpa: profileData.student?.gpa || '0.00'
        });
        
        // Fetch notifications separately to handle errors gracefully
        try {
          const notificationsData = await studentAPI.getNotifications(true);
          const unread = notificationsData.notifications || [];
          setUnreadCount(unread.length);
          
          // Fetch all notifications for display
          const allNotifications = await studentAPI.getNotifications();
          setNotifications(allNotifications.notifications?.slice(0, 5) || []);
        } catch (notifError) {
          console.warn('Could not fetch notifications:', notifError);
          // Continue without notifications - don't block dashboard
          setUnreadCount(0);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await studentAPI.markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {profile?.name}</p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <h3>My GPA</h3>
            <div className="dashboard-stats">{stats.gpa}</div>
            <p>Current Grade Point Average</p>
            <Link to="/student/grades" className="btn btn-outline btn-small">
              Update Grades
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Applications</h3>
            <div className="dashboard-stats">{stats.applicationCount}</div>
            <p>Course Applications Submitted</p>
            <Link to="/student/applications" className="btn btn-outline btn-small">
              View Applications
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Admissions</h3>
            <div className="dashboard-stats">0</div>
            <p>Admission Offers Received</p>
            <Link to="/student/admissions" className="btn btn-outline btn-small">
              Check Status
            </Link>
          </Card>

          <Card className="dashboard-card">
            <h3>Job Opportunities</h3>
            <div className="dashboard-stats">0</div>
            <p>Available Jobs Matching Your Profile</p>
            <Link to="/student/jobs" className="btn btn-outline btn-small">
              Browse Jobs
            </Link>
          </Card>
        </div>

        <div className="dashboard-actions">
          <Link to="/student/apply" className="btn btn-primary">
            Apply for Courses
          </Link>
          <Link to="/student/grades" className="btn btn-secondary">
            Enter Grades
          </Link>
          <Link to="/student/profile" className="btn btn-outline">
            Update Profile
          </Link>
        </div>

			{/* Email verification notice intentionally removed as per requirements */}

        {unreadCount > 0 && (
          <Card title={`Notifications (${unreadCount} unread)`} className="notifications-card">
            <div className="notifications-list">
              {notifications.filter(n => !n.read).slice(0, 5).map(notification => (
                <div 
                  key={notification.id} 
                  className="notification-item"
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    marginBottom: '10px',
                    backgroundColor: notification.read ? '#f9f9f9' : '#fff3cd',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <strong>{notification.title || 'Notification'}</strong>
                      <p style={{ margin: '5px 0' }}>{notification.message}</p>
                      <small>{formatFirebaseDate(notification.createdAt)}</small>
                    </div>
                    {!notification.read && (
                      <span className="badge" style={{ backgroundColor: '#007bff', color: 'white' }}>
                        New
                      </span>
                    )}
                  </div>
                  {notification.jobId && (
                    <Link 
                      to="/student/jobs" 
                      className="btn btn-outline btn-small"
                      style={{ marginTop: '10px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Job
                    </Link>
                  )}
                </div>
              ))}
              {notifications.filter(n => !n.read).length === 0 && (
                <p>No new notifications</p>
              )}
            </div>
            {notifications.length > 5 && (
              <Link to="/student/notifications" className="btn btn-outline btn-small" style={{ marginTop: '10px' }}>
                View All Notifications
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;