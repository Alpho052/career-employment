const { db, auth } = require('../config/firebase');

// =====================================================================
// ===== USER MANAGEMENT ===============================================
// =====================================================================

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  const userRef = db.collection('users').doc(userId);

  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in the database.' });
    }
    const user = userDoc.data();

    // 1. Delete from Firebase Authentication
    try {
      await auth.deleteUser(userId);
    } catch (error) {
      // If user is already gone from Auth, it's not a fatal error. Log it and continue cleanup.
      if (error.code === 'auth/user-not-found') {
        console.warn(`User ${userId} was not found in Firebase Authentication. Continuing cleanup from database.`);
      } else {
        // For any other auth-related error, stop immediately and report it.
        console.error('❌ Firebase Auth Deletion Error:', error);
        return res.status(500).json({
          success: false,
          error: `Failed to delete user from Authentication: ${error.message}. This could be a permissions issue with the service account.`
        });
      }
    }

    // 2. Delete from Firestore 'users' collection
    await userRef.delete();

    // 3. Delete from role-specific collection (e.g., 'companies', 'students')
    if (user.role && user.role !== 'admin') {
      const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
      const roleDocRef = db.collection(collectionName).doc(userId);
      if ((await roleDocRef.get()).exists) {
        await roleDocRef.delete();
      }
    }

    // 4. If the user was a company, delete their associated jobs
    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      if (!jobsSnapshot.empty) {
        const batch = db.batch();
        jobsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
    }

    return res.json({ success: true, message: 'User and all related data deleted successfully.' });

  } catch (error) {
    console.error(`❌ Unexpected error in deleteUser for userID: ${userId}:`, error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected server error occurred during user deletion. Please check the server logs.' 
    });
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
