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

// ✅ Export all functions your routes need
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
