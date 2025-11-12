import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CareerConnect Lesotho</h3>
            <p>
              Bridging the gap between education and employment in Lesotho. 
              Empowering students and connecting talent with opportunities.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>For Students</h4>
            <ul>
              <li><Link to="/login">Find Courses</Link></li>
              <li><Link to="/login">Apply Online</Link></li>
              <li><Link to="/login">Career Guidance</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: info@careerconnect.ls</p>
            <p>Phone: +266 1234 5678</p>
            <p>Location: Maseru, Lesotho</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 CareerConnect Lesotho. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;