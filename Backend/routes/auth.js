const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { db } = require('../db');
const { users } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { name, email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Check if user already exists and is verified
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0 && existingUser[0].is_verified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (existingUser.length > 0) {
      // Update existing unverified user
      await db.update(users)
        .set({ name, otp, otp_expiry: otpExpiry })
        .where(eq(users.email, email));
    } else {
      // Create new unverified user
      await db.insert(users).values({
        name,
        email,
        password: '', // Will be set during registration
        otp,
        otp_expiry: otpExpiry,
        is_verified: false,
      });
    }

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP for Complaints Portal',
      text: `Hello ${name}, your OTP is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user[0];

    if (userData.otp !== otp || new Date() > new Date(userData.otp_expiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await db.update(users)
      .set({ 
        password, 
        is_verified: true, 
        otp: null, 
        otp_expiry: null 
      })
      .where(eq(users.email, email));

    res.json({ message: 'Registration successful. You can now login.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0 || !user[0].is_verified || user[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userData = user[0];
    const token = jwt.sign(
      { id: userData.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: false, // Per requirements: not HttpOnly for easier local testing
      secure: false,   // Per requirements: not Secure
      sameSite: 'lax', // Per requirements: not Strict
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user[0];
    res.json({
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
