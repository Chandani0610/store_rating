const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_secured!';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const [users] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
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

    const token = jwt.sign(
      { userId: newUserId, role: 'USER', email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the platform.',
      token,
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

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
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

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);

    return res.json({ success: true, message: 'Password updated successfully.' });
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
