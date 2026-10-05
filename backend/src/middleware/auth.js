const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_secured!';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user exists and retrieve fresh record from database
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Security notice: User account not found or deactivated.' });
    }

    const user = rows[0];

    // Security Feature: Invalidate older tokens if password was modified after token issuance
    if (user.updated_at && decoded.iat) {
      const lastModifiedSeconds = Math.floor(new Date(user.updated_at).getTime() / 1000);
      // 5-second buffer for clock skew / database transaction timing
      if (decoded.iat < lastModifiedSeconds - 5) {
        return res.status(401).json({
          success: false,
          message: 'Security notice: Account credentials were recently changed. Please log in with your updated credentials.',
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Your login session has expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or forged authentication token.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only users with role [${roles.join(', ')}] can perform this action.`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
