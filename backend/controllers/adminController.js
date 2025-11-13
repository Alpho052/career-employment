const { db, auth } = require('../config/firebase');

// =====================================================================
// ===== USER MANAGEMENT ===============================================
// =====================================================================

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in database' });
    }

    const user = userDoc.data();

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.warn(`User ${userId} not found in Firebase Auth, continuing...`);
      } else {
        throw new Error(`Firebase Auth Error: ${error.message}`);
      }
    }

    await userRef.delete();

    if (user.role && user.role !== 'admin') {
      const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
      try {
        await db.collection(collectionName).doc(userId).delete();
      } catch (error) {
        console.warn(`Could not delete from ${collectionName}:`, error);
      }
    }

    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    }

    res.json({ success: true, message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== INSTITUTIONS & COMPANIES ======================================
// =====================================================================

const getInstitutions = async (req, res) => {
  try {
    let query = db.collection('institutions');
    if (req.query.status) query = query.where('status', '==', req.query.status);
    const snapshot = await query.get();
    const institutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, institutions });
  } catch (error) {
    console.error('❌ Get institutions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getCompanies = async (req, res) => {
  try {
    let query = db.collection('companies');
    if (req.query.status) query = query.where('status', '==', req.query.status);
    const snapshot = await query.get();
    const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, companies });
  } catch (error) {
    console.error('❌ Get companies error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateInstitutionStatus = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const institutionRef = db.collection('institutions').doc(institutionId);
    const doc = await institutionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    await institutionRef.update({ status, updatedAt: new Date() });
    res.json({ success: true, message: `Institution status updated to ${status}` });
  } catch (error) {
    console.error('Error updating institution status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const companyRef = db.collection('companies').doc(companyId);
    const doc = await companyRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    await companyRef.update({ status, updatedAt: new Date() });
    res.json({ success: true, message: `Company status updated to ${status}` });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Placeholder functions (to avoid undefined errors)
const getSystemStats = (req, res) => res.json({ success: true, stats: {} });
const createInstitution = (req, res) => res.json({ success: true, message: 'Institution created' });
const updateInstitution = (req, res) => res.json({ success: true, message: 'Institution updated' });
const deleteInstitution = (req, res) => res.json({ success: true, message: 'Institution deleted' });
const getInstitutionCourses = (req, res) => res.json({ success: true, courses: [] });
const addInstitutionCourse = (req, res) => res.json({ success: true, message: 'Course added' });
const updateCourse = (req, res) => res.json({ success: true, message: 'Course updated' });
const deleteCourse = (req, res) => res.json({ success: true, message: 'Course deleted' });
const deleteCompany = (req, res) => res.json({ success: true, message: 'Company deleted' });
const publishAdmissions = (req, res) => res.json({ success: true, message: 'Admissions published' });
const migrateCompanies = (req, res) => res.json({ success: true, message: 'Companies migrated' });

// Export everything
module.exports = {
  getSystemStats,
  getInstitutions,
  createInstitution,
  updateInstitution,
  updateInstitutionStatus,
  deleteInstitution,
  getInstitutionCourses,
  addInstitutionCourse,
  updateCourse,
  deleteCourse,
  getCompanies,
  updateCompanyStatus,
  deleteCompany,
  publishAdmissions,
  migrateCompanies,
  getUsers,
  deleteUser,
};

