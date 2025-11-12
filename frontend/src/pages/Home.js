import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsSection from '../components/landing/StatsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import { publicAPI } from '../services/api';
import Card from '../components/common/Card';

const Home = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role;
      if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'institution') {
        navigate('/institution/dashboard', { replace: true });
      } else if (role === 'company') {
        navigate('/company/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await publicAPI.getInstitutions();
        setInstitutions(data.data || []);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  return (
    <div className="home-page">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      
      {/* Featured Institutions Section */}
      <section className="featured-institutions">
        <div className="container">
          <h2>Featured Institutions</h2>
          <p className="section-subtitle">Discover leading higher learning institutions in Lesotho</p>
          
          {loading ? (
            <div className="loading-state">Loading institutions...</div>
          ) : (
            <>
              <div className="institutions-grid">
                {institutions.slice(0, 6).map(institution => (
                  <Card key={institution.id} className="institution-card">
                    <div className="institution-placeholder">
                      <div className="institution-icon" aria-hidden="true"></div>
                    </div>
                    <div className="institution-info">
                      <h3>{institution.name}</h3>
                      <p className="institution-location">{institution.location}</p>
                      <p className="institution-type">{institution.type}</p>
                      <Link to="/login" className="btn btn-outline btn-small">
                        View Courses
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/register" className="btn btn-primary">
                  Join Now to Explore More
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <TestimonialsSection />
    </div>
  );
};

export default Home;