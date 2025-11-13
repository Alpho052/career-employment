const { db, auth } = require('../config/firebase');
const { sendEmail } = require('../utils/emailService');
const { generateVerificationCode } = require('../utils/helpers');

// =====================================================================
// ===== USER MANAGEMENT ===============================================
// =====================================================================

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userDoc.data();

    await auth.deleteUser(userId);
    await userRef.delete();

    if (user.role !== 'admin') {
      const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
      await db.collection(collectionName).doc(userId).delete();
    }

    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
// ===== VERIFICATION EMAIL ============================================
// =====================================================================

const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User is already verified' });
    }

    const verificationCode = generateVerificationCode();
    await db.collection('users').doc(userDoc.id).update({
      verificationCode,
      updatedAt: new Date()
    });

    await sendEmail(email, verificationCode);
    res.json({ success: true, message: `Verification email sent to ${email}.` });
  } catch (error) {
    console.error('❌ Send verification email error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== SYSTEM STATS ==================================================
// =====================================================================

const getSystemStats = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const institutionsSnapshot = await db.collection('institutions').get();
    const companiesSnapshot = await db.collection('companies').get();
    const jobsSnapshot = await db.collection('jobs').get();

    res.json({
      success: true,
      stats: {
        totalUsers: usersSnapshot.size,
        institutions: institutionsSnapshot.size,
        pendingInstitutions: institutionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        companies: companiesSnapshot.size,
        pendingCompanies: companiesSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        jobs: jobsSnapshot.size,
      },
    });
  } catch (error) {
    console.error('❌ Get system stats error:', error);
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


// =====================================================================
// ===== PLACEHOLDER CONTROLLERS (to prevent undefined errors) =========
// =====================================================================

const createInstitution = (req, res) => res.json({ success: true, message: 'Create institution placeholder' });
const updateInstitution = (req, res) => res.json({ success: true, message: 'Update institution placeholder' });
const updateInstitutionStatus = (req, res) => res.json({ success: true, message: 'Update institution status placeholder' });
const deleteInstitution = (req, res) => res.json({ success: true, message: 'Delete institution placeholder' });

const getInstitutionCourses = (req, res) => res.json({ success: true, message: 'Institution courses placeholder' });
const addInstitutionCourse = (req, res) => res.json({ success: true, message: 'Add institution course placeholder' });

const updateCourse = (req, res) => res.json({ success: true, message: 'Update course placeholder' });
const deleteCourse = (req, res) => res.json({ success: true, message: 'Delete course placeholder' });

const updateCompanyStatus = (req, res) => res.json({ success: true, message: 'Update company status placeholder' });
const deleteCompany = (req, res) => res.json({ success: true, message: 'Delete company placeholder' });

const publishAdmissions = (req, res) => res.json({ success: true, message: 'Publish admissions placeholder' });
const migrateCompanies = (req, res) => res.json({ success: true, message: 'Migrate companies placeholder' });

// =====================================================================
// ===== EXPORT ========================================================
// =====================================================================

module.exports = {
  deleteUser,
  getUsers,
  sendVerificationEmail,
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
};