import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    type: '',
    contactEmail: '',
    phone: ''
  });

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

  useEffect(() => {
    fetchInstitutions();
  }, [filter]);

  const fetchInstitutions = async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const data = await adminAPI.getInstitutions(status);
      setInstitutions(data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInstitutionStatus = async (institutionId, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateInstitutionStatus(institutionId, newStatus);
      await fetchInstitutions();
      setMessage('Institution status updated successfully');
    } catch (error) {
      setMessage('Error updating institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.createInstitution(institutionForm);
      setMessage('Institution created successfully');
      setShowAddModal(false);
      setInstitutionForm({
        name: '',
        email: '',
        password: '',
        location: '',
        type: '',
        contactEmail: '',
        phone: ''
      });
      await fetchInstitutions();
    } catch (error) {
      setMessage('Error creating institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (institution) => {
    setSelectedInstitution(institution);
    setInstitutionForm({
      name: institution.name || '',
      email: institution.email || '',
      password: '',
      location: institution.location || '',
      type: institution.type || '',
      contactEmail: institution.contactEmail || institution.email || '',
      phone: institution.phone || ''
    });
    setShowEditModal(true);
    setMessage('');
  };

  const handleUpdateInstitution = async (e) => {
    e.preventDefault();
    if (!selectedInstitution) return;
    setUpdating(true);
    setMessage('');
    try {
      const updateData = { ...institutionForm };
      delete updateData.password; // Don't send password if empty
      if (!updateData.password) delete updateData.password;
      await adminAPI.updateInstitution(selectedInstitution.id, updateData);
      setMessage('Institution updated successfully');
      setShowEditModal(false);
      setSelectedInstitution(null);
      await fetchInstitutions();
    } catch (error) {
      setMessage('Error updating institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteInstitution = async (institutionId) => {
    if (!window.confirm('Are you sure you want to delete this institution? This will also delete all associated courses.')) {
      return;
    }
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.deleteInstitution(institutionId);
      setMessage('Institution deleted successfully');
      await fetchInstitutions();
    } catch (error) {
      setMessage('Error deleting institution: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const openCoursesModal = async (institution) => {
    setSelectedInstitution(institution);
    setShowCoursesModal(true);
    setMessage('');
    try {
      const data = await adminAPI.getInstitutionCourses(institution.id);
      setCourses(data.courses || []);
    } catch (error) {
      setMessage('Error loading courses: ' + (error.message || error));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedInstitution) return;
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.addInstitutionCourse(selectedInstitution.id, courseForm);
      setMessage('Course added successfully');
      setShowAddCourseModal(false);
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
      const data = await adminAPI.getInstitutionCourses(selectedInstitution.id);
      setCourses(data.courses || []);
    } catch (error) {
      setMessage('Error adding course: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    setUpdating(true);
    setMessage('');
    try {
      await adminAPI.deleteCourse(courseId);
      setMessage('Course deleted successfully');
      const data = await adminAPI.getInstitutionCourses(selectedInstitution.id);
      setCourses(data.courses || []);
    } catch (error) {
      setMessage('Error deleting course: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-success';
      case 'pending': return 'status-warning';
      case 'suspended': return 'status-error';
      case 'rejected': return 'status-error';
      default: return 'status-info';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading institutions..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Institutions</h1>
          <p>Review and manage higher learning institutions</p>
        </div>

        <Card title="Institutions">
          <div className="filter-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <label>Filter by status:</label>
              <select 
                className="form-control"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginLeft: '10px', display: 'inline-block', width: 'auto' }}
              >
                <option value="all">All Institutions</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowAddModal(true);
                setMessage('');
                setInstitutionForm({
                  name: '',
                  email: '',
                  password: '',
                  location: '',
                  type: '',
                  contactEmail: '',
                  phone: ''
                });
              }}
            >
              Add New Institution
            </button>
          </div>

          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}

          {institutions.length === 0 ? (
            <div className="no-institutions">
              <h3>No institutions found</h3>
              <p>There are no institutions matching your current filter.</p>
            </div>
          ) : (
            <div className="institutions-list">
              {institutions.map(institution => (
                <Card key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <div className="institution-info">
                      <h4>{institution.name}</h4>
                      <p>Email: {institution.email}</p>
                      <p>Location: {institution.location || 'Not specified'}</p>
                      <p>Type: {institution.type || 'Not specified'}</p>
                    </div>
                    <div className="institution-status">
                      <span className={`status ${getStatusColor(institution.status)}`}>
                        {institution.status}
                      </span>
                    </div>
                  </div>

                  <div className="institution-details">
                    <p><strong>Registered:</strong> {new Date(institution.createdAt).toLocaleDateString()}</p>
                    {institution.contactEmail && (
                      <p><strong>Contact:</strong> {institution.contactEmail}</p>
                    )}
                    {institution.phone && (
                      <p><strong>Phone:</strong> {institution.phone}</p>
                    )}
                  </div>

                  <div className="institution-actions">
                    {institution.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                          disabled={updating}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => updateInstitutionStatus(institution.id, 'rejected')}
                          disabled={updating}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {institution.status === 'approved' && (
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => updateInstitutionStatus(institution.id, 'suspended')}
                        disabled={updating}
                      >
                        Suspend
                      </button>
                    )}
                    {institution.status === 'suspended' && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => updateInstitutionStatus(institution.id, 'approved')}
                        disabled={updating}
                      >
                        Reactivate
                      </button>
                    )}
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => openEditModal(institution)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => openCoursesModal(institution)}
                    >
                      Manage Courses
                    </button>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteInstitution(institution.id)}
                      disabled={updating}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Add Institution Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Institution" size="large">
          <form onSubmit={handleCreateInstitution}>
            <div className="form-group">
              <label>Institution Name *</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={institutionForm.email}
                onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                value={institutionForm.password}
                onChange={(e) => setInstitutionForm({ ...institutionForm, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.location}
                onChange={(e) => setInstitutionForm({ ...institutionForm, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.type}
                onChange={(e) => setInstitutionForm({ ...institutionForm, type: e.target.value })}
                placeholder="e.g., University, College"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={institutionForm.contactEmail}
                onChange={(e) => setInstitutionForm({ ...institutionForm, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.phone}
                onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={updating}>
                Create Institution
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Institution Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Institution" size="large">
          <form onSubmit={handleUpdateInstitution}>
            <div className="form-group">
              <label>Institution Name *</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={institutionForm.email}
                disabled
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.location}
                onChange={(e) => setInstitutionForm({ ...institutionForm, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.type}
                onChange={(e) => setInstitutionForm({ ...institutionForm, type: e.target.value })}
                placeholder="e.g., University, College"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={institutionForm.contactEmail}
                onChange={(e) => setInstitutionForm({ ...institutionForm, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                value={institutionForm.phone}
                onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={updating}>
                Update Institution
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Manage Courses Modal */}
        <Modal isOpen={showCoursesModal} onClose={() => setShowCoursesModal(false)} title={`Manage Courses - ${selectedInstitution?.name}`} size="large">
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
              {message}
            </div>
          )}
          <div style={{ marginBottom: '15px' }}>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => {
                setShowAddCourseModal(true);
                setMessage('');
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
              }}
            >
              Add Course
            </button>
          </div>
          {courses.length === 0 ? (
            <p>No courses found for this institution.</p>
          ) : (
            <div className="courses-list">
              {courses.map(course => (
                <Card key={course.id} className="course-card" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4>{course.name}</h4>
                      <p><strong>Faculty:</strong> {course.faculty}</p>
                      {course.description && <p>{course.description}</p>}
                      {course.duration && <p><strong>Duration:</strong> {course.duration}</p>}
                      {course.capacity && <p><strong>Capacity:</strong> {course.capacity}</p>}
                    </div>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteCourse(course.id)}
                      disabled={updating}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Modal>

        {/* Add Course Modal */}
        <Modal isOpen={showAddCourseModal} onClose={() => setShowAddCourseModal(false)} title="Add Course" size="large">
          <form onSubmit={handleAddCourse}>
            <div className="form-group">
              <label>Course Name *</label>
              <input
                type="text"
                className="form-control"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Faculty *</label>
              <input
                type="text"
                className="form-control"
                value={courseForm.faculty}
                onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                className="form-control"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                placeholder="e.g., 4 years"
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                className="form-control"
                value={courseForm.capacity}
                onChange={(e) => setCourseForm({ ...courseForm, capacity: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={updating}>
                Add Course
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddCourseModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageInstitutions;