import React, { useState, useEffect } from 'react';
import { institutionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFacultyId, setEditFacultyId] = useState('');

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    headOfDepartment: ''
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const data = await institutionAPI.getFaculties();
      setFaculties(data.faculties || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFacultyForm({
      name: '',
      code: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      headOfDepartment: ''
    });
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await institutionAPI.addFaculty(facultyForm);
      setMessage('Faculty added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchFaculties();
    } catch (error) {
      setMessage('Error adding faculty: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (faculty) => {
    setEditFacultyId(faculty.id);
    setFacultyForm({
      name: faculty.name || '',
      code: faculty.code || '',
      description: faculty.description || '',
      contactEmail: faculty.contactEmail || '',
      contactPhone: faculty.contactPhone || '',
      headOfDepartment: faculty.headOfDepartment || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!editFacultyId) return;
    setSaving(true);
    setMessage('');

    try {
      await institutionAPI.updateFaculty(editFacultyId, facultyForm);
      setMessage('Faculty updated successfully!');
      setShowEditModal(false);
      setEditFacultyId('');
      resetForm();
      fetchFaculties();
    } catch (error) {
      setMessage('Error updating faculty: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm('Delete this faculty? This action cannot be undone.')) return;
    setMessage('');

    try {
      await institutionAPI.deleteFaculty(facultyId);
      setMessage('Faculty deleted successfully!');
      fetchFaculties();
    } catch (error) {
      setMessage('Error deleting faculty: ' + error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading faculties..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Manage Faculties</h1>
          <p>Create and maintain faculties/departments for your institution</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <Card
          title="Faculties"
          actions={
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              Add Faculty
            </button>
          }
        >
          {faculties.length === 0 ? (
            <div className="no-faculties">
              <h3>No faculties found</h3>
              <p>Create your first faculty to start organising courses.</p>
            </div>
          ) : (
            <div className="faculties-list">
              {faculties.map(faculty => (
                <Card key={faculty.id} className="faculty-card">
                  <div className="faculty-header">
                    <div>
                      <h4>{faculty.name}</h4>
                      {faculty.code && <span className="badge">Code: {faculty.code}</span>}
                    </div>
                    <div className="faculty-actions">
                      <button className="btn btn-outline btn-small" onClick={() => openEditModal(faculty)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-small" onClick={() => handleDeleteFaculty(faculty.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="faculty-details">
                    {faculty.description && <p>{faculty.description}</p>}
                    <div className="faculty-meta">
                      {faculty.headOfDepartment && (
                        <div><strong>Head of Department:</strong> {faculty.headOfDepartment}</div>
                      )}
                      {faculty.contactEmail && (
                        <div><strong>Email:</strong> {faculty.contactEmail}</div>
                      )}
                      {faculty.contactPhone && (
                        <div><strong>Phone:</strong> {faculty.contactPhone}</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card title="How Faculties Are Used" className="guidelines-card">
          <ul>
            <li>Faculties help organise courses by department or school.</li>
            <li>When adding a course, you can select one of your faculties.</li>
            <li>Provide up-to-date contact details for prospective students.</li>
            <li>Keep descriptions short and informative.</li>
          </ul>
        </Card>

        {/* Add Faculty Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Faculty"
          size="medium"
        >
          <form onSubmit={handleAddFaculty}>
            <div className="form-group">
              <label className="form-label">Faculty Name *</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                required
                placeholder="e.g., Faculty of Science"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Code</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.code}
                onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                placeholder="e.g., FOS"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Head of Department</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.headOfDepartment}
                onChange={(e) => setFacultyForm({ ...facultyForm, headOfDepartment: e.target.value })}
                placeholder="Name of the person in charge"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={facultyForm.contactEmail}
                onChange={(e) => setFacultyForm({ ...facultyForm, contactEmail: e.target.value })}
                placeholder="department@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={facultyForm.contactPhone}
                onChange={(e) => setFacultyForm({ ...facultyForm, contactPhone: e.target.value })}
                placeholder="Department phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={facultyForm.description}
                onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                placeholder="Brief description of the faculty"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Add Faculty'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Faculty Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Faculty"
          size="medium"
        >
          <form onSubmit={handleUpdateFaculty}>
            <div className="form-group">
              <label className="form-label">Faculty Name *</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Code</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.code}
                onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Head of Department</label>
              <input
                type="text"
                className="form-control"
                value={facultyForm.headOfDepartment}
                onChange={(e) => setFacultyForm({ ...facultyForm, headOfDepartment: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={facultyForm.contactEmail}
                onChange={(e) => setFacultyForm({ ...facultyForm, contactEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={facultyForm.contactPhone}
                onChange={(e) => setFacultyForm({ ...facultyForm, contactPhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={facultyForm.description}
                onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageFaculties;

