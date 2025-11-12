import React, { useState, useEffect } from 'react';
import { studentAPI, publicAPI } from '../../services/api';
import { formatFirebaseDate } from '../../utils/dateHelper';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseApplication = () => {
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [institutionsData, applicationsData, profileData] = await Promise.all([
          publicAPI.getInstitutions(),
          studentAPI.getApplications(),
          studentAPI.getProfile()
        ]);
        
        setInstitutions(institutionsData.data || []);
        setApplications(applicationsData.applications || []);
        setStudentProfile(profileData.student || null);
        setStudentGrades((profileData.grades || []).map(g => ({ subject: g.subject, grade: g.grade })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedInstitution) {
        try {
          const response = await publicAPI.getInstitutionCourses(selectedInstitution);
          setCourses(response.data || []);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setCourses([]);
        }
      } else {
        setCourses([]);
      }
    };

    fetchCourses();
  }, [selectedInstitution]);

  const getApplicationsByInstitution = (institutionId) => {
    return applications.filter(app => app.institutionId === institutionId);
  };

  const canApplyToInstitution = (institutionId) => {
    const institutionApplications = getApplicationsByInstitution(institutionId);
    return institutionApplications.length < 2;
  };

  const meetsCourseRequirements = (course) => {
    if (!studentProfile) return false;
    const reqs = course.requirements || {};
    const gpaOk = !reqs.minGPA || Number(studentProfile.gpa || 0) >= Number(reqs.minGPA);
    if (!gpaOk) return false;
    if (Array.isArray(reqs.requiredSubjects) && reqs.requiredSubjects.length > 0) {
      const minGrade = Number(reqs.minSubjectGrade || 0);
      for (const subj of reqs.requiredSubjects) {
        const found = studentGrades.find(g => (g.subject || '').toLowerCase() === String(subj).toLowerCase());
        if (!found || Number(found.grade || 0) < minGrade) return false;
      }
    }
    return true;
  };

  const requirementReason = (course) => {
    if (!studentProfile) return 'Loading profile...';
    const reqs = course.requirements || {};
    if (reqs.minGPA && Number(studentProfile.gpa || 0) < Number(reqs.minGPA)) {
      return `Requires GPA ≥ ${reqs.minGPA} (yours: ${Number(studentProfile.gpa || 0).toFixed(2)})`;
    }
    if (Array.isArray(reqs.requiredSubjects) && reqs.requiredSubjects.length > 0) {
      const minGrade = Number(reqs.minSubjectGrade || 0);
      for (const subj of reqs.requiredSubjects) {
        const found = studentGrades.find(g => (g.subject || '').toLowerCase() === String(subj).toLowerCase());
        if (!found || Number(found.grade || 0) < minGrade) {
          return `Requires ${subj} ≥ ${minGrade}%`;
        }
      }
    }
    return '';
  };

  const handleApplication = async (courseId) => {
    if (!selectedInstitution) {
      setMessage('Please select an institution first');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await studentAPI.applyForCourses([
        {
          institutionId: selectedInstitution,
          courseId: courseId
        }
      ]);

      setMessage('Application submitted successfully!');
      
      // Refresh applications
      const applicationsData = await studentAPI.getApplications();
      setApplications(applicationsData.applications || []);
    } catch (error) {
      setMessage('Error submitting application: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading application data..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Course Applications</h1>
          <p>Apply to courses from various institutions (Max 2 per institution)</p>
        </div>

        <div className="application-layout">
          <Card title="Select Institution" className="institution-selection">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Choose Institution</label>
              <select
                className="form-control"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
              >
                <option value="">Select an institution</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name} 
                    {getApplicationsByInstitution(institution.id).length > 0 && 
                      ` (${getApplicationsByInstitution(institution.id).length}/2 applied)`
                    }
                  </option>
                ))}
              </select>
            </div>

            {selectedInstitution && (
              <div className="institution-info">
                <h4>Available Courses</h4>
                <p>
                  You can apply to {2 - getApplicationsByInstitution(selectedInstitution).length} more 
                  course(s) at this institution
                </p>

                {courses.length > 0 ? (
                  <div className="courses-grid">
                    {courses.map(course => (
                      <Card key={course.id} className="course-card">
                        <h4>{course.name}</h4>
                        <p className="course-faculty">{course.faculty}</p>
                        <p className="course-description">
                          {course.description || 'No description available'}
                        </p>
                        {course.requirements && (
                          <div className="course-reqs">
                            {course.requirements.minGPA && (
                              <div className="badge">Min GPA: {course.requirements.minGPA}</div>
                            )}
                            {Array.isArray(course.requirements.requiredSubjects) && course.requirements.requiredSubjects.length > 0 && (
                              <div className="badge">Required: {course.requirements.requiredSubjects.join(', ')}</div>
                            )}
                          </div>
                        )}
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleApplication(course.id)}
                          disabled={
                            submitting || 
                            !canApplyToInstitution(selectedInstitution) ||
                            !meetsCourseRequirements(course) ||
                            applications.some(app => 
                              app.institutionId === selectedInstitution && 
                              app.courseId === course.id
                            )
                          }
                        >
                          {applications.some(app => 
                            app.institutionId === selectedInstitution && 
                            app.courseId === course.id
                          ) ? 'Applied' : 'Apply Now'}
                        </button>
                        {!meetsCourseRequirements(course) && (
                          <div className="note" style={{ marginTop: '6px', color: '#b94a48' }}>
                            {requirementReason(course) || 'You do not meet the requirements.'}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>No courses available for this institution.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Your Applications" className="applications-list">
            <h4>Current Applications</h4>
            {applications.length === 0 ? (
              <p>You haven't applied to any courses yet.</p>
            ) : (
              <div className="applications-table">
                {applications.map(application => (
                  <div key={application.id} className="application-item">
                    <div className="application-info">
                      <strong>{application.course?.name || 'Unknown Course'}</strong>
                      <span>at {application.institution?.name || 'Unknown Institution'}</span>
                    </div>
                    <div className={`application-status status-${application.status}`}>
                      {application.status}
                    </div>
                    <div className="application-date">
                      Applied: {formatFirebaseDate(application.appliedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseApplication;