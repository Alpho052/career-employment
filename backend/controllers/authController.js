const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, auth } = require('../config/firebase');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateVerificationCode } = require('../utils/helpers');

// User registration
const register = async (req, res) => {
  try {
    const { email, password, name, role, additionalData } = req.body;

    console.log(`📝 Registration attempt: ${email} as ${role}`);

    // Check if user already exists in Firestore
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    let userRecord;
    try {
      // Create user in Firebase Auth
      userRecord = await auth.createUser({
        email,
        password: hashedPassword,
        displayName: name,
        emailVerified: false
      });
    } catch (firebaseError) {
      console.error('❌ Firebase Auth creation error:', firebaseError);

      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      throw firebaseError;
    }

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      name,
      role,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      ...additionalData
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Create role-specific document (except for admin)
    if (role !== 'admin') {
      const roleData = {
        uid: userRecord.uid,
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending', // require admin approval
        ...additionalData
      };

      const collectionName = role === 'company' ? 'companies' : `${role}s`;
      await db.collection(collectionName).doc(userRecord.uid).set(roleData);
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.log('⚠️ Email sending failed, but registration continues');
    }

    console.log(`✅ User registered successfully: ${email}`);
    console.log(`📧 Verification code: ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: userRecord.uid,
        email,
        name,
        role,
        isVerified: false
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
      details: error.message
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    if (usersSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Please verify your email first',
        needsVerification: true
      });
    }

    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Account is not active. Please contact support.'
      });
    }

    const token = jwt.sign(
      {
        userId: userDoc.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ User logged in successfully: ${email}`);

    res.json({
      success: true,
message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login',
      details: error.message
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    console.log(`📧 Email verification attempt: ${email}`);

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required'
      });
    }

    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    if (usersSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    await db.collection('users').doc(userDoc.id).update({
      isVerified: true,
      verificationCode: null,
      updatedAt: new Date()
    });

    try {
      await auth.updateUser(user.uid, {
        emailVerified: true
      });
    } catch (firebaseError) {
      console.error('⚠️ Could not update Firebase Auth email status:', firebaseError);
    }

    console.log(`✅ Email verified successfully: ${email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during email verification',
      details: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userDoc.data();
    const { password, verificationCode, ...userProfile } = user;

    res.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  getProfile
};
