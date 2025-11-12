import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourseId, setEditCourseId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [courseForm, setCourseForm] = useState({
    name: '',
    faculty: '',
    description: '',
    duration: '',
    requirements: {
      minGPA: '',
      requiredSubjects: [],
      minSubjectGrade: ''
    },
    capacity: ''
  });

  const SUBJECTS = [
    'Mathematics','English','Physical Science','Biology','Chemistry','Geography','History','Accounting','Economics','Computer Studies','Business Studies'
  ];

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await institutionAPI.getCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const data = await institutionAPI.getFaculties();
      setFaculties(data.faculties || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoadingFaculties(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await institutionAPI.addCourse(courseForm);
      setMessage('Course added successfully!');
      setShowAddModal(false);
      setCourseForm({
        name: '',
        faculty: '',
        description: '',
        duration: '',
        requirements: {
          minGPA: '',
          requiredSubjects: [],
          minSubjectGrade: ''
        },
        capacity: ''
      });
      fetchCourses();
    } catch (error) {
      setMessage('Error adding course: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (course) => {
    setEditCourseId(course.id);
    setCourseForm({
      name: course.name || '',
      faculty: course.faculty || '',
      description: course.description || '',
      duration: course.duration || '',
      requirements: {
        minGPA: (course.requirements && course.requirements.minGPA) || '',
        requiredSubjects: (course.requirements && course.requirements.requiredSubjects) || [],
        minSubjectGrade: (course.requirements && course.requirements.minSubjectGrade) || ''
      },
      capacity: course.capacity || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editCourseId) return;
    setSaving(true);
    setMessage('');

    try {
      await institutionAPI.updateCourse(editCourseId, courseForm);
      setMessage('Course updated successfully!');
      setShowEditModal(false);
      setEditCourseId('');
      fetchCourses();
    } catch (error) {
      setMessage('Error updating course: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    if (field.startsWith('requirements.')) {
      const reqField = field.split('.')[1];
      setCourseForm({
        ...courseForm,
        requirements: {
          ...courseForm.requirements,
          [reqField]: value
        }
      });
    } else {
      setCourseForm({
        ...courseForm,
        [field]: value
      });
    }
  };

  if (loading || loadingFaculties) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Courses</h1>
          <p>Add and manage courses offered by your institution</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <Card 
          title="Your Courses" 
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add New Course
            </button>
          }
        >
          {courses.length === 0 ? (
            <div className="no-courses">
              <h3>No courses added yet</h3>
              <p>Start by adding your first course to attract students.</p>
            </div>
          ) : (
            <div className="courses-table">
              {courses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <h4>{course.name}</h4>
                    <p className="course-faculty">{course.faculty}</p>
                    <p className="course-description">{course.description}</p>
                    <div className="course-details">
                      <span>Duration: {course.duration}</span>
                      {course.requirements.minGPA && (
                        <span>Min GPA: {course.requirements.minGPA}</span>
                      )}
                      {course.capacity && (
                        <span>Capacity: {course.capacity} students</span>
                      )}
                    </div>
                  </div>
                  <div className="course-actions">
                    <button className="btn btn-outline btn-small" onClick={() => openEditModal(course)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={async () => {
                      if (!window.confirm('Delete this course? This cannot be undone.')) return;
                      try {
                        await institutionAPI.deleteCourse(course.id);
                        setMessage('Course deleted successfully!');
                        fetchCourses();
                      } catch (error) {
                        setMessage('Error deleting course: ' + error.message);
                      }
                    }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Course"
          size="large"
        >
          <form onSubmit={handleAddCourse}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faculty/Department</label>
                {faculties.length === 0 ? (
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      value={courseForm.faculty}
                      onChange={(e) => handleFormChange('faculty', e.target.value)}
                      required
                      placeholder="Enter faculty name (create faculties under Manage Faculties)"
                    />
                    <small className="form-helper">
                      Tip: Create faculties first for easier course organisation.{' '}
                      <Link to="/institution/faculties">Manage Faculties</Link>
                    </small>
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={courseForm.faculty}
                    onChange={(e) => handleFormChange('faculty', e.target.value)}
                    required
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={courseForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Describe the course content and objectives"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  placeholder="e.g., 4 years, 2 semesters"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.capacity}
                  onChange={(e) => handleFormChange('capacity', e.target.value)}
                  placeholder="Maximum number of students"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum GPA Requirement</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.requirements.minGPA}
                  onChange={(e) => handleFormChange('requirements.minGPA', e.target.value)}
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="e.g., 3.0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory High School Subjects</label>
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '10px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9'
                }}>
                  {SUBJECTS.map(subj => (
                    <label key={subj} style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={(courseForm.requirements?.requiredSubjects || []).includes(subj)}
                        onChange={(e) => {
                          const current = (courseForm.requirements?.requiredSubjects || []);
                          const updated = e.target.checked
                            ? [...current, subj]
                            : current.filter(s => s !== subj);
                          handleFormChange('requirements.requiredSubjects', updated);
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      {subj}
                    </label>
                  ))}
                </div>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Selected: {courseForm.requirements.requiredSubjects.length} subject(s)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Subject Pass (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.requirements.minSubjectGrade}
                  onChange={(e) => handleFormChange('requirements.minSubjectGrade', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g., 60"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Adding Course...' : 'Add Course'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Course"
          size="large"
        >
          <form onSubmit={handleUpdateCourse}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faculty/Department</label>
                {faculties.length === 0 ? (
                  <input
                    type="text"
                    className="form-control"
                    value={courseForm.faculty}
                    onChange={(e) => handleFormChange('faculty', e.target.value)}
                    required
                  />
                ) : (
                  <select
                    className="form-control"
                    value={courseForm.faculty}
                    onChange={(e) => handleFormChange('faculty', e.target.value)}
                    required
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={courseForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-control"
                  value={courseForm.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.capacity}
                  onChange={(e) => handleFormChange('capacity', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum GPA Requirement</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.requirements.minGPA}
                  onChange={(e) => handleFormChange('requirements.minGPA', e.target.value)}
                  min="0"
                  max="4"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory High School Subjects</label>
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '10px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9'
                }}>
                  {SUBJECTS.map(subj => (
                    <label key={subj} style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={courseForm.requirements.requiredSubjects.includes(subj)}
                        onChange={(e) => {
                          const current = courseForm.requirements.requiredSubjects || [];
                          const updated = e.target.checked
                            ? [...current, subj]
                            : current.filter(s => s !== subj);
                          handleFormChange('requirements.requiredSubjects', updated);
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      {subj}
                    </label>
                  ))}
                </div>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Selected: {courseForm.requirements.requiredSubjects.length} subject(s)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Subject Pass (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={courseForm.requirements.minSubjectGrade}
                  onChange={(e) => handleFormChange('requirements.minSubjectGrade', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCourses;