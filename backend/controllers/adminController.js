/*const { db, auth } = require('../config/firebase');

// Delete a user and all their associated data
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = userDoc.data();

    // Delete from Firebase Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await userRef.delete();

    // Delete from role-specific collection
    if (user.role !== 'admin') {
      const collectionName = user.role === 'company' ? 'companies' : `${user.role}s`;
      await db.collection(collectionName).doc(userId).delete();
    }

    // Optional: Delete related data (e.g., jobs for a company)
    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = { 
  deleteUser 
};*/
const { db, auth } = require('../config/firebase');

// ====== System Stats ======
const getSystemStats = async (req, res) => {
  try {
    const usersCount = (await db.collection('users').get()).size;
    const companiesCount = (await db.collection('companies').get()).size;
    const institutionsCount = (await db.collection('institutions').get()).size;
    res.json({
      success: true,
      stats: { usersCount, companiesCount, institutionsCount }
    });
  } catch (error) {
    console.error('❌ getSystemStats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ====== Institutions ======
const getInstitutions = async (req, res) => {
  try {
    const snapshot = await db.collection('institutions').get();
    const institutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, institutions });
  } catch (error) {
    console.error('❌ getInstitutions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const createInstitution = async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('institutions').add({ ...data, createdAt: new Date() });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ createInstitution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = req.body;
    await db.collection('institutions').doc(institutionId).update({ ...data, updatedAt: new Date() });
    res.json({ success: true, message: 'Institution updated' });
  } catch (error) {
    console.error('❌ updateInstitution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateInstitutionStatus = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { status } = req.body;
    await db.collection('institutions').doc(institutionId).update({ status, updatedAt: new Date() });
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('❌ updateInstitutionStatus error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    await db.collection('institutions').doc(institutionId).delete();
    res.json({ success: true, message: 'Institution deleted' });
  } catch (error) {
    console.error('❌ deleteInstitution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ====== Institution Courses ======
const getInstitutionCourses = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snapshot = await db.collection('courses').where('institutionId', '==', institutionId).get();
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
    const data = req.body;
    const docRef = await db.collection('courses').add({ ...data, institutionId, createdAt: new Date() });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ addInstitutionCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await db.collection('courses').doc(courseId).update({ ...req.body, updatedAt: new Date() });
    res.json({ success: true, message: 'Course updated' });
  } catch (error) {
    console.error('❌ updateCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await db.collection('courses').doc(courseId).delete();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('❌ deleteCourse error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ====== Companies ======
const getCompanies = async (req, res) => {
  try {
    const snapshot = await db.collection('companies').get();
    const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, companies });
  } catch (error) {
    console.error('❌ getCompanies error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;
    await db.collection('companies').doc(companyId).update({ status, updatedAt: new Date() });
    res.json({ success: true, message: 'Company status updated' });
  } catch (error) {
    console.error('❌ updateCompanyStatus error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    await db.collection('companies').doc(companyId).delete();
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    console.error('❌ deleteCompany error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ====== Users ======
const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ getUsers error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

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

// ====== Admissions & Migration (dummy) ======
const publishAdmissions = async (req, res) => res.json({ success: true, message: 'Admissions published' });
const migrateCompanies = async (req, res) => res.json({ success: true, message: 'Companies migrated' });

// ====== Export all functions ======
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
  getUsers,
  publishAdmissions,
  migrateCompanies,
  deleteUser
};
