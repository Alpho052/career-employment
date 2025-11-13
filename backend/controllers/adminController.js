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

    // 1. Delete from Firebase Authentication
    try {
      await auth.deleteUser(userId);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.warn(`User ${userId} not found in Firebase Auth, proceeding with cleanup.`);
      } else {
        throw new Error(`Firebase Auth Error: ${error.message}`);
      }
    }

    // 2. Delete from 'users' collection
    await userRef.delete();

    // 3. Delete from role-specific collection
    if (user.role && user.role !== 'admin') {
      try {
        const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
        await db.collection(collectionName).doc(userId).delete();
      } catch (error) {
        console.warn(`Could not delete from ${user.role} collection:`, error);
      }
    }

    // 4. Delete jobs if company
    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      if (!jobsSnapshot.empty) {
        const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      }
    }

    res.json({ success: true, message: 'User and associated data deleted successfully' });

  } catch (error) {
    console.error('❌ Error in deleteUser controller:', error);
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
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
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
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
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
    const institutionDoc = await institutionRef.get();

    if (!institutionDoc.exists) {
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
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    await companyRef.update({ status, updatedAt: new Date() });

    res.json({ success: true, message: `Company status updated to ${status}` });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== PLACEHOLDER CONTROLLERS (so routes don’t break) ===============
// =====================================================================

const getSystemStats = async (req, res) => res.json({ success: true, message: 'System stats not implemented yet' });
const createInstitution = async (req, res) => res.json({ success: true, message: 'Create institution not implemented yet' });
const updateInstitution = async (req, res) => res.json({ success: true, message: 'Update institution not implemented yet' });
const deleteInstitution = async (req, res) => res.json({ success: true, message: 'Delete institution not implemented yet' });
const getInstitutionCourses = async (req, res) => res.json({ success: true, message: 'Get institution courses not implemented yet' });
const addInstitutionCourse = async (req, res) => res.json({ success: true, message: 'Add institution course not implemented yet' });
const updateCourse = async (req, res) => res.json({ success: true, message: 'Update course not implemented yet' });
const deleteCourse = async (req, res) => res.json({ success: true, message: 'Delete course not implemented yet' });
const deleteCompany = async (req, res) => res.json({ success: true, message: 'Delete company not implemented yet' });
const publishAdmissions = async (req, res) => res.json({ success: true, message: 'Publish admissions not implemented yet' });
const migrateCompanies = async (req, res) => res.json({ success: true, message: 'Migrate companies not implemented yet' });

// =====================================================================
// ===== EXPORTS =======================================================
// =====================================================================

module.exports = {
  deleteUser,
  getUsers,
  getInstitutions,
  getCompanies,
  updateInstitutionStatus,
  updateCompanyStatus,
  getSystemStats,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionCourses,
  addInstitutionCourse,
  updateCourse,
  deleteCourse,
  deleteCompany,
  publishAdmissions,
  migrateCompanies
};
