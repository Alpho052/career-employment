import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import CourseApplication from './pages/Student/CourseApplication';
import GradeEntry from './pages/Student/GradeEntry';
import JobApplications from './pages/Student/JobApplications';
import Admissions from './pages/Student/Admissions';

// Institution Pages
import InstitutionDashboard from './pages/Institution/InstitutionDashboard';
import ManageCourses from './pages/Institution/ManageCourses';
import ManageFaculties from './pages/Institution/ManageFaculties';
import StudentApplications from './pages/Institution/StudentApplications';
import InstitutionProfile from './pages/Institution/InstitutionProfile';
import AdmissionsSettings from './pages/Institution/AdmissionsSettings';

// Company Pages
import CompanyDashboard from './pages/Company/CompanyDashboard';
import PostJob from './pages/Company/PostJob';
import ViewApplicants from './pages/Company/ViewApplicants';
import CompanyProfile from './pages/Company/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageInstitutions from './pages/Admin/ManageInstitutions';
import ManageCompanies from './pages/Admin/ManageCompanies';
import SystemReports from './pages/Admin/SystemReports';

import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/profile" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              } />
              <Route path="/student/apply" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CourseApplication />
                </ProtectedRoute>
              } />
              <Route path="/student/grades" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <GradeEntry />
                </ProtectedRoute>
              } />
              <Route path="/student/jobs" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <JobApplications />
                </ProtectedRoute>
              } />
              <Route path="/student/admissions" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Admissions />
                </ProtectedRoute>
              } />

              {/* Institution Routes */}
              <Route path="/institution/dashboard" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />
              <Route path="/institution/courses" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <ManageCourses />
                </ProtectedRoute>
              } />
              <Route path="/institution/faculties" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <ManageFaculties />
                </ProtectedRoute>
              } />
              <Route path="/institution/applications" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <StudentApplications />
                </ProtectedRoute>
              } />
              <Route path="/institution/profile" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionProfile />
                </ProtectedRoute>
              } />
              <Route path="/institution/admissions" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <AdmissionsSettings />
                </ProtectedRoute>
              } />

              {/* Company Routes */}
              <Route path="/company/dashboard" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/company/post-job" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/company/applicants" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <ViewApplicants />
                </ProtectedRoute>
              } />
              <Route path="/company/profile" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProfile />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/institutions" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageInstitutions />
                </ProtectedRoute>
              } />
              <Route path="/admin/companies" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageCompanies />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemReports />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;