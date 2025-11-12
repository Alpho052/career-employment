import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '#';
    
    switch (currentUser.role) {
      case 'student': return '/student/dashboard';
      case 'institution': return '/institution/dashboard';
      case 'company': return '/company/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '#';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h2>CareerConnect Lesotho</h2>
          </Link>
          
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            
            {currentUser ? (
              <>
                <Link to={getDashboardLink()} className="nav-link">Dashboard</Link>
                <span className="user-welcome">Welcome, {currentUser.name}</span>
                <span className="user-role">({currentUser.role})</span>
                <button onClick={handleLogout} className="btn btn-outline btn-small">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;