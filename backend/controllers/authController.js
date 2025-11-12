const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, auth } = require('../config/firebase');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateVerificationCode } = require('../utils/helpers');

// User registration
const register = async (req, res) => {
  try {
    const { email, password, name, role, additionalData } = req.body;

    // Prevent duplicate user creation
    const userExists = await auth.getUserByEmail(email).catch(() => null);
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists with this email' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const userRecord = await auth.createUser({
      email,
      password: hashedPassword,
      displayName: name,
      emailVerified: false
    });

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

    if (role !== 'admin') {
      const roleData = {
        uid: userRecord.uid,
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        ...additionalData
      };
      const collectionName = role === 'company' ? 'companies' : `${role}s`;
      await db.collection(collectionName).doc(userRecord.uid).set(roleData);
    }

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: userRecord.uid, email, name, role, isVerified: false }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Email verification
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
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

    await auth.updateUser(user.uid, { emailVerified: true });
    await db.collection('users').doc(userDoc.id).update({
      isVerified: true,
      verificationCode: null,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      return res.status(400).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const user = usersSnapshot.docs[0].data();

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is already verified' 
      });
    }

    await sendVerificationEmail(email, user.verificationCode);

    res.json({ 
      success: true,
      message: 'Verification email sent. Please check your inbox.' 
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email not verified', 
        needsVerification: true 
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is not active. Please contact support.' 
      });
    }

    const token = jwt.sign(
      { userId: userDoc.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: userDoc.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = { 
  register, 
  verifyEmail, 
  resendVerification, 
  login 
};