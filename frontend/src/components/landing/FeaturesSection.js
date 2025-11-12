import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      title: "Find Your Course",
      description: "Explore courses from various institutions and find the perfect fit for your career goals.",
      icon: null
    },
    {
      title: "Easy Applications",
      description: "Apply to multiple institutions with a streamlined application process.",
      icon: null
    },
    {
      title: "Career Opportunities",
      description: "Connect with top companies and find job opportunities after graduation.",
      icon: null
    },
    {
      title: "Progress Tracking",
      description: "Monitor your applications and admissions status in real-time.",
      icon: null
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2>How It Works</h2>
        <p className="section-subtitle">Your complete career journey in one platform</p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" aria-hidden="true"></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;