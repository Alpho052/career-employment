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
      error: `An unexpected error occurred during user deletion: ${error.message}` 
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
        console.warn(`User ${userId} not found in Firebase Auth, proceeding with DB cleanup.`);
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
        console.warn(`Could not delete from role collection '${user.role}':`, error);
      }
    }

    // 4. If company, delete associated jobs
    if (user.role === 'company') {
      const jobsSnapshot = await db.collection('jobs').where('companyId', '==', userId).get();
      if (!jobsSnapshot.empty) {
        const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      }
    }

    res.json({ success: true, message: 'User and all associated data deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      error: `An unexpected error occurred: ${error.message}` 
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
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
    console.error('❌ Error fetching institutions:', error);
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
    console.error('❌ Error fetching companies:', error);
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
    console.error('❌ Error updating institution status:', error);
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
    console.error('❌ Error updating company status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// =====================================================================
// ===== EXPORTS ========================================================
// =====================================================================

module.exports = {
  deleteUser,
  getUsers,
  getInstitutions,
  getCompanies,
  updateInstitutionStatus,
  updateCompanyStatus,
};
