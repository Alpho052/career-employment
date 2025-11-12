import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "This platform helped me find the perfect course and get admitted to my dream institution!",
      author: "Lerato M.",
      role: "Computer Science Student"
    },
    {
      quote: "As an institution, we've streamlined our admission process and reached more qualified students.",
      author: "Dr. Thabo S.",
      role: "University Administrator"
    },
    {
      quote: "We found excellent candidates through this platform. The matching system is incredible!",
      author: "Tech Solutions Ltd",
      role: "Partner Company"
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2>Success Stories</h2>
        <p className="section-subtitle">Hear from our students, institutions, and partners</p>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{testimonial.quote}"</p>
              </div>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;