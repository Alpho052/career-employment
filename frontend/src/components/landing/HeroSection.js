import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Career Journey Starts Here</h1>
            <p className="hero-subtitle">
              Discover higher education opportunities in Lesotho and launch your professional career 
              with our integrated career guidance and employment platform.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-graphics">
            <div className="graphic-item">
              <div className="graphic-icon" aria-hidden="true"></div>
              <p>Find Courses</p>
            </div>
            <div className="graphic-item">
              <div className="graphic-icon" aria-hidden="true"></div>
              <p>Get Hired</p>
            </div>
            <div className="graphic-item">
              <div className="graphic-icon" aria-hidden="true"></div>
              <p>Grow Your Career</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;