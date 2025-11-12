import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  getProfile: () => api.get('/auth/profile'),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  updateGrades: (grades) => api.put('/students/grades', { grades }),
  applyForCourses: (applications) => api.post('/students/apply', { applications }),
  getApplications: () => api.get('/students/applications'),
  decideOnOffer: (applicationId, decision) => api.put(`/students/applications/${applicationId}/decision`, { decision }),
  getJobApplicationIds: () => api.get('/students/jobs/applications/ids'),
  getSavedJobIds: () => api.get('/students/jobs/saved/ids'),
  applyForJob: (jobId) => api.post(`/students/jobs/${jobId}/apply`),
  saveJob: (jobId) => api.post(`/students/jobs/${jobId}/save`),
  getAvailableJobs: () => api.get('/students/jobs'),
  uploadDocument: (data) => api.post('/students/documents', data),
  getDocuments: (documentType) => api.get(`/students/documents${documentType ? `?documentType=${documentType}` : ''}`),
  deleteDocument: (documentId) => api.delete(`/students/documents/${documentId}`),
  getNotifications: (unreadOnly) => api.get(`/students/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
  markNotificationRead: (notificationId) => api.put(`/students/notifications/${notificationId}/read`),
};

// Institution API
export const institutionAPI = {
  getProfile: () => api.get('/institutions/profile'),
  updateProfile: (data) => api.put('/institutions/profile', data),
  getFaculties: () => api.get('/institutions/faculties'),
  addFaculty: (data) => api.post('/institutions/faculties', data),
  updateFaculty: (facultyId, data) => api.put(`/institutions/faculties/${facultyId}`, data),
  deleteFaculty: (facultyId) => api.delete(`/institutions/faculties/${facultyId}`),
  getCourses: () => api.get('/institutions/courses'),
  addCourse: (data) => api.post('/institutions/courses', data),
  updateCourse: (courseId, data) => api.put(`/institutions/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/institutions/courses/${courseId}`),
  getApplications: (status) => api.get(`/institutions/applications${status ? `?status=${status}` : ''}`),
  updateApplicationStatus: (applicationId, status) => api.put(`/institutions/applications/${applicationId}/status`, { status }),
  updateAdmissionsSettings: (data) => api.put('/institutions/admissions/settings', data),
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  getJobs: () => api.get('/companies/jobs'),
  postJob: (data) => api.post('/companies/jobs', data),
  updateJob: (jobId, data) => api.put(`/companies/jobs/${jobId}`, data),
  getJobApplicants: (jobId) => api.get(`/companies/jobs/${jobId}/applicants`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getInstitutions: (status) => api.get(`/admin/institutions${status ? `?status=${status}` : ''}`),
  createInstitution: (data) => api.post('/admin/institutions', data),
  updateInstitution: (institutionId, data) => api.put(`/admin/institutions/${institutionId}`, data),
  updateInstitutionStatus: (institutionId, status) => api.put(`/admin/institutions/${institutionId}/status`, { status }),
  deleteInstitution: (institutionId) => api.delete(`/admin/institutions/${institutionId}`),
  getInstitutionCourses: (institutionId) => api.get(`/admin/institutions/${institutionId}/courses`),
  addInstitutionCourse: (institutionId, data) => api.post(`/admin/institutions/${institutionId}/courses`, data),
  updateCourse: (courseId, data) => api.put(`/admin/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  getCompanies: (status) => api.get(`/admin/companies${status ? `?status=${status}` : ''}`),
  updateCompanyStatus: (companyId, status) => api.put(`/admin/companies/${companyId}/status`, { status }),
  deleteCompany: (companyId) => api.delete(`/admin/companies/${companyId}`),
  getUsers: (role) => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  publishAdmissions: (action, institutionId) => api.post('/admin/admissions/publish', { action, institutionId }),
};

// Public API
export const publicAPI = {
  getInstitutions: () => api.get('/public/institutions'),
  getStats: () => api.get('/public/stats'),
  getInstitutionCourses: (institutionId) => api.get(`/public/institutions/${institutionId}/courses`),
};

export default api;