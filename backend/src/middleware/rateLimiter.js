// In-memory security rate-limiter & brute-force shield for authentication

const loginAttempts = new Map();

// Configuration
const MAX_ATTEMPTS = 5; // Max failed attempts allowed
const WINDOW_MS = 5 * 60 * 1000; // 5 minute tracking window
const LOCKOUT_MS = 2 * 60 * 1000; // 2 minute lockout penalty

/**
 * Clean up old keys periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > WINDOW_MS && !data.lockedUntil) {
      loginAttempts.delete(key);
    } else if (data.lockedUntil && now > data.lockedUntil) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Middleware to check if the current IP / email is currently locked out
 */
const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const email = (req.body.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;

  const record = loginAttempts.get(key);
  const now = Date.now();

  if (record && record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Security Lockout: Too many failed login attempts. Please wait ${remainingSeconds} seconds before trying again.`,
      retryAfter: remainingSeconds,
    });
  }

  next();
};

/**
 * Record a failed login attempt
 */
const recordFailedAttempt = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const email = (req.body.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  const now = Date.now();

  const record = loginAttempts.get(key) || { count: 0, firstAttempt: now, lastAttempt: now };

  // Reset count if window passed
  if (now - record.firstAttempt > WINDOW_MS) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
  } else {
    record.count += 1;
  }

  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  loginAttempts.set(key, record);
};

/**
 * Clear failed attempts after a successful login
 */
const clearLoginAttempts = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const email = (req.body.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  loginAttempts.delete(key);
};

module.exports = {
  loginRateLimiter,
  recordFailedAttempt,
  clearLoginAttempts,
};
