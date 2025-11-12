import React, { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';

const StatsSection = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicAPI.getStats();
        console.log('Stats data:', data); // Debug log
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { label: 'Students', value: stats.students || 0 },
    { label: 'Institutions', value: stats.institutions || 0 },
    { label: 'Companies', value: stats.companies || 0 },
    { label: 'Jobs Available', value: stats.jobs || 0 }
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {statItems.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">
                {loading ? '...' : stat.value.toLocaleString()}
              </div>
              <div className="stat-label">{stat.label}</div>
              {stat.label === 'Institutions' && stats.pendingInstitutions > 0 && (
                <div className="stat-subtext">
                  ({stats.approvedInstitutions || 0} approved, {stats.pendingInstitutions} pending)
                </div>
              )}
              {stat.label === 'Companies' && stats.pendingCompanies > 0 && (
                <div className="stat-subtext">
                  ({stats.approvedCompanies || 0} approved, {stats.pendingCompanies} pending)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;