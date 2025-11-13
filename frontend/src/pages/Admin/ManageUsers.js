import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch users.';
      setError(`Error fetching users: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      return;
    }
    try {
      await adminAPI.deleteUser(userId);
      fetchAllUsers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred.';
      setError(`Error deleting user: ${errorMessage}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Users</h1>
          <p>Manage all users in the system</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <Card title="All Users">
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="users-list">
              {users.map(user => (
                <Card key={user.id} className="user-card">
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.isVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                  <div className="user-actions">
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteUser(user.id)}
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

export default ManageUsers;