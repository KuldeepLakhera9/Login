import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

import User from './models/User.js';
import OTP from './models/OTP.js';

// Resolve __dirname in ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexoraa-db';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Express Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
console.log('Connecting to MongoDB at:', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('\n❌ MONGODB CONNECTION ERROR:');
    console.error('Could not connect to MongoDB. Please ensure that:');
    console.error('1. MongoDB is installed on your local machine.');
    console.error('2. The MongoDB local service is running (e.g. run "brew services start mongodb-community" or "mongod").');
    console.error('Error detail:', err.message, '\n');
  });

// JWT Verification Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found in database' });
      }
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// --- AUTH API ROUTES ---

// 1. Sign Up Endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error during signup', error: error.message });
  }
});

// 2. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login', error: error.message });
  }
});
// 3. Get Current Logged In User Profile (Protected Route)
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving user profile' });
  }
});

// 4. Google OAuth Sign-In Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'No access token provided' });
    }

    // Fetch user details from Google userinfo API using the accessToken
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Failed to verify access token with Google' });
    }

    const userData = await googleRes.json();
    const { name, email, picture } = userData;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not provide an email address' });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (password is omitted, avatarUrl is stored)
      user = await User.create({
        name: name || 'Google User',
        email: email,
        avatarUrl: picture
      });
      console.log(`Created new Google authenticated user: ${email}`);
    } else {
      // Update avatarUrl if it changed or wasn't set
      if (user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        await user.save();
      }
      console.log(`Logged in existing Google user: ${email}`);
    }

    // Generate our local JWT token for session management
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Internal server error during Google authentication', error: error.message });
  }
});

// Email transporter configuration (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 5. Send Email OTP Endpoint
app.post('/api/auth/otp/send', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Generate random 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/upsert the OTP entry in MongoDB (will overwrite any previous OTP for this email)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { code: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`Generated OTP code [${otpCode}] for: ${email}`);

    // Send the email if Gmail SMTP parameters are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: `"Nexoraa Auth" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Nexoraa Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Nexoraa Verification</h2>
            <p>Use the following 6-digit verification code to complete your login or registration:</p>
            <div style="background-color: #f3f4f6; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0; color: #1e1b4b;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: #6b7280;">This code is valid for 5 minutes. If you did not request this, you can ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Successfully sent email OTP to ${email}`);
      res.status(200).json({ message: 'Verification code sent to your email.' });
    } else {
      // Fallback in case Gmail SMTP isn't configured in development
      console.log(`[DEV FALLBACK] Gmail credentials not set. Displaying code: ${otpCode}`);
      res.status(200).json({ 
        message: 'Verification code generated (Developer Fallback). Check terminal output.',
        devFallbackCode: otpCode // return code for easier local testing/presentations if not set
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send verification code', error: error.message });
  }
});

// 6. Verify Email OTP Endpoint
app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Search for the matching active OTP record in MongoDB
    const activeOTP = await OTP.findOne({ email: email.toLowerCase(), code });

    if (!activeOTP) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // OTP code matched successfully! Clear it from database
    await OTP.deleteOne({ _id: activeOTP._id });

    // Find or create user in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create a new user (password is omitted for OTP registrations)
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase()
      });
      console.log(`Created new OTP registered user: ${email}`);
    } else {
      console.log(`Logged in existing OTP user: ${email}`);
    }

    // Generate local JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
