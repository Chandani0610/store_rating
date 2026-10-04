// Validation rules based strictly on documentation:
// - Name: Min 20 characters, Max 60 characters.
// - Address: Max 400 characters.
// - Password: 8-16 characters, must include at least one uppercase letter and one special character.
// - Email: Must follow standard email validation rules.
// - Ratings: Between 1 to 5

const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

const validateNameFormat = (name) => {
  if (!name || typeof name !== 'string') return false;
  const len = name.trim().length;
  return len >= 20 && len <= 60;
};

const validateAddressFormat = (address) => {
  if (!address || typeof address !== 'string') return false;
  const len = address.trim().length;
  return len > 0 && len <= 400;
};

const validatePasswordFormat = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  return hasUppercase && hasSpecial;
};

const validateRatingValue = (rating) => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

// Express Middlewares
const validateSignup = (req, res, next) => {
  const { name, email, address, password } = req.body;
  const errors = [];

  if (!validateNameFormat(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  if (!validateEmailFormat(email)) {
    errors.push('Email must follow standard email validation rules.');
  }

  if (!validateAddressFormat(address)) {
    errors.push('Address is required and must not exceed 400 characters.');
  }

  if (!validatePasswordFormat(password)) {
    errors.push('Password must be 8-16 characters and include at least one uppercase letter and one special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
};

const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!validatePasswordFormat(newPassword)) {
    errors.push('New password must be 8-16 characters and include at least one uppercase letter and one special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
};

const validateStoreCreate = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Store name is required.');
  } else if (name.trim().length < 3 || name.trim().length > 60) {
    errors.push('Store name must be between 3 and 60 characters.');
  }

  if (!validateEmailFormat(email)) {
    errors.push('Store email must follow standard email validation rules.');
  }

  if (!validateAddressFormat(address)) {
    errors.push('Store address is required and must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
};

const validateRatingSubmit = (req, res, next) => {
  const { rating } = req.body;
  if (!validateRatingValue(rating)) {
    return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
  }
  next();
};

module.exports = {
  validateEmailFormat,
  validateNameFormat,
  validateAddressFormat,
  validatePasswordFormat,
  validateRatingValue,
  validateSignup,
  validatePasswordUpdate,
  validateStoreCreate,
  validateRatingSubmit,
};
