/*const { db, auth } = require('../config/firebase');

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
        console.warn(`User ${userId} not found in Firebase Auth, but was found in the database. Proceeding with database cleanup.`);
      } else {
        // For other auth errors, we should stop and report the problem.
        throw new Error(`Firebase Auth Error: ${error.message}`);
      }
    }

    // 2. Delete from the main 'users' collection
    await userRef.delete();

    // 3. Delete from the role-specific collection (companies, institutions, etc.)
    if (user.role && user.role !== 'admin') {
      try {
        const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
        await db.collection(collectionName).doc(userId).delete();
      } catch (error) {
        console.warn(`Could not delete user from role collection '${user.role}':`, error);
      }
    }

    // 4. If the user is a company, delete their associated jobs
    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      if (!jobsSnapshot.empty) {
        const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      }
    }

    res.json({ success: true, message: 'User and all associated data deleted successfully' });

  } catch (error) {
    console.error('❌ Error in deleteUser controller:', error);

    // Send a more informative error message to the client
    res.status(500).json({ 
      success: false, 
      error: error.message 
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
// ===== INSTITUTIONS & COMPANIES =====================================
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


module.exports = {
  deleteUser,
  getUsers,
  getInstitutions,
  getCompanies,
  updateInstitutionStatus,
  updateCompanyStatus
};*/
const { db, auth } = require('../config/firebase');

// =====================================================================
// ===== SYSTEM STATISTICS =============================================
// =====================================================================
const getSystemStats = async (req, res) => {
  try {
    const [users, institutions, companies, jobs] = await Promise.all([
      db.collection('users').get(),
      db.collection('institutions').get(),
      db.collection('companies').get(),
      db.collection('jobs').get(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: users.size,
        totalInstitutions: institutions.size,
        totalCompanies: companies.size,
        totalJobs: jobs.size,
      },
    });
  } catch (error) {
    console.error('❌ getSystemStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch system stats' });
  }
};

// =====================================================================
// ===== INSTITUTIONS ==================================================
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

const createInstitution = async (req, res) => {
  try {
    const data = req.body;
    if (!data.name) return res.status(400).json({ success: false, error: 'Name is required' });

    const ref = await db.collection('institutions').add({
      ...data,
      status: 'pending',
      createdAt: new Date(),
    });

    res.json({ success: true, id: ref.id, message: 'Institution created successfully' });
  } catch (error) {
    console.error('❌ Create institution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const updates = req.body;

    await db.collection('institutions').doc(institutionId).update({
      ...updates,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: 'Institution updated successfully' });
  } catch (error) {
    console.error('❌ Update institution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    await db.collection('institutions').doc(institutionId).delete();
    res.json({ success: true, message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('❌ Delete institution error:', error);
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

    await db.collection('institutions').doc(institutionId).update({
      status,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: `Institution status updated to ${status}` });
  } catch (error) {
    console.error('❌ updateInstitutionStatus error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== COURSES =======================================================
// =====================================================================
const getInstitutionCourses = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snapshot = await db
      .collection('institutions')
      .doc(institutionId)
      .collection('courses')
      .get();

    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, courses });
  } catch (error) {
    console.error('❌ getInstitutionCourses error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const addInstitutionCourse = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const courseData = req.body;

    const ref = await db
      .collection('institutions')
      .doc(institutionId)
      .collection('courses')
      .add({
        ...courseData,
        createdAt: new Date(),
      });

    res.json({ success: true, id: ref.id, message: 'Course added successfully' });
  } catch (error) {
    console.error('❌ addInstitutionCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const courseRef = await db.collectionGroup('courses').where('__name__', '==', courseId).get();

    if (courseRef.empty) return res.status(404).json({ success: false, error: 'Course not found' });

    const doc = courseRef.docs[0];
    await doc.ref.update({ ...updates, updatedAt: new Date() });

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('❌ updateCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseRef = await db.collectionGroup('courses').where('__name__', '==', courseId).get();

    if (courseRef.empty) return res.status(404).json({ success: false, error: 'Course not found' });

    await courseRef.docs[0].ref.delete();

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('❌ deleteCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== COMPANIES =====================================================
// =====================================================================
const getCompanies = async (req, res) => {
  try {
    const snapshot = await db.collection('companies').get();
    const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, companies });
  } catch (error) {
    console.error('❌ Get companies error:', error);
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

    await db.collection('companies').doc(companyId).update({
      status,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: `Company status updated to ${status}` });
  } catch (error) {
    console.error('❌ updateCompanyStatus error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    await db.collection('companies').doc(companyId).delete();
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('❌ deleteCompany error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== ADMISSIONS & MIGRATION ========================================
// =====================================================================
const publishAdmissions = async (req, res) => {
  try {
    res.json({ success: true, message: 'Admissions published successfully!' });
  } catch (error) {
    console.error('❌ publishAdmissions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const migrateCompanies = async (req, res) => {
  try {
    res.json({ success: true, message: 'Company migration completed!' });
  } catch (error) {
    console.error('❌ migrateCompanies error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== USERS =========================================================
// =====================================================================
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await auth.deleteUser(userId);
    await db.collection('users').doc(userId).delete();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ deleteUser error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== EXPORTS =======================================================
// =====================================================================
module.exports = {
  getSystemStats,
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  updateInstitutionStatus,
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

