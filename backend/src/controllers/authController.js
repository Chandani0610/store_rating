const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { recordFailedAttempt, clearLoginAttempts } = require('../middleware/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_secured!';

// Supported token validity windows: 7 days, 30 days, 365 days (1 year), 1825 days (5 years)
const ALLOWED_DURATIONS = {
  '7d': '7d',
  '30d': '30d',
  '365d': '365d',
  '1825d': '1825d', // 5 years (~1825 days)
};

const login = async (req, res) => {
  try {
    const { email, password, rememberDuration } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      'SELECT id, name, email, password, address, role, updated_at FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      recordFailedAttempt(req);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailedAttempt(req);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Login successful -> clear failed brute-force tracking
    clearLoginAttempts(req);

    // Selected session duration: defaults to 5 years (1825d) for uninterrupted access
    const duration = ALLOWED_DURATIONS[rememberDuration] || '1825d';

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: duration }
    );

    let storeInfo = null;
    if (user.role === 'STORE_OWNER') {
      const [stores] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
                ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
                COUNT(r.id) AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ? OR s.email = ?
         GROUP BY s.id LIMIT 1`,
        [user.id, user.email]
      );
      if (stores.length > 0) {
        storeInfo = stores[0];
      }
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: duration,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: storeInfo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, address.trim(), 'USER']
    );

    const newUserId = result.insertId;

    // Default to 5-year persistent session
    const token = jwt.sign(
      { userId: newUserId, role: 'USER', email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '1825d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the platform.',
      token,
      expiresIn: '1825d',
      user: {
        id: newUserId,
        name: name.trim(),
        email: cleanEmail,
        address: address.trim(),
        role: 'USER',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    let storeInfo = null;

    if (user.role === 'STORE_OWNER') {
      const [stores] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
                ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
                COUNT(r.id) AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ? OR s.email = ?
         GROUP BY s.id LIMIT 1`,
        [user.id, user.email]
      );
      if (stores.length > 0) {
        storeInfo = stores[0];
      }
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: storeInfo,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT password, email, role FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const currentHash = rows[0].password;
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update password and touch updated_at
    await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, userId]
    );

    // Issue refreshed token for the current active device
    const newToken = jwt.sign(
      { userId, role: rows[0].role, email: rows[0].email },
      JWT_SECRET,
      { expiresIn: '1825d' }
    );

    return res.json({
      success: true,
      message: 'Password updated successfully! Previous device sessions have been securely invalidated.',
      token: newToken,
    });
  } catch (error) {
    console.error('updatePassword error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

module.exports = {
  login,
  signup,
  getMe,
  updatePassword,
};
