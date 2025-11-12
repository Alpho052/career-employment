const { db, auth } = require('../config/firebase');
const { sendEmail } = require('../utils/emailService');

const { generateVerificationCode } = require('../utils/helpers'); // optional helper

// ===== User Management =====
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

// ===== Verification Email =====
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

// ===== Export all =====
module.exports = {
  deleteUser,
  sendVerificationEmail,
  // add your other controllers here (getUsers, getInstitutions, etc.)
};

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
      verificationCode: verificationCode,
      updatedAt: new Date()
    });

    await sendEmail(email, verificationCode);

    res.json({ success: true, message: `Verification email sent to ${email}.` });

  } catch (error) {
    console.error('❌ Send verification email error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { 
  deleteUser 
};*/
