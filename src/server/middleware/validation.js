export const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Registration request body received (silent logging)
  // console.log('Registration request body:', req.body);

  // Required fields
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || !password.trim()) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!firstName || !firstName.trim()) {
    errors.push('First name is required');
  }

  if (!lastName || !lastName.trim()) {
    errors.push('Last name is required');
  }

  // Validation errors found (silent logging)
  // console.log('Validation errors:', errors);

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || !password.trim()) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateDiscussion = (req, res, next) => {
  const { title, content, category } = req.body;
  const errors = [];

  if (!title || !title.trim() || title.length < 5 || title.length > 100) {
    errors.push('Title must be between 5 and 100 characters');
  }

  if (!content || !content.trim() || content.length < 10 || content.length > 5000) {
    errors.push('Content must be between 10 and 5000 characters');
  }

  const validCategories = [
    'general',
    'crop-management',
    'pest-control',
    'soil-health',
    'irrigation',
    'weather',
    'market-prices',
    'success-stories',
    'equipment'
  ];

  if (!category || !validCategories.includes(category)) {
    errors.push('Invalid category');
  }

  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.push('Tags must be an array');
  }

  if (req.body.images && !Array.isArray(req.body.images)) {
    errors.push('Images must be an array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateReply = (req, res, next) => {
  const { content } = req.body;
  const errors = [];

  if (!content || !content.trim() || content.length < 2 || content.length > 2000) {
    errors.push('Reply must be between 2 and 2000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, phone, farmSize, cropTypes } = req.body;
  const errors = [];

  if (firstName !== undefined && (!firstName.trim() || firstName.length < 2 || firstName.length > 50)) {
    errors.push('First name must be between 2 and 50 characters');
  }

  if (lastName !== undefined && (!lastName.trim() || lastName.length < 2 || lastName.length > 50)) {
    errors.push('Last name must be between 2 and 50 characters');
  }

  if (phone !== undefined && phone.trim() && !/^(\+\d{1,3}[- ]?)?\d{9,15}$/.test(phone)) {
    errors.push('Please provide a valid phone number');
  }

  if (farmSize !== undefined && farmSize.trim() && !['small', 'medium', 'large', ''].includes(farmSize)) {
    errors.push('Invalid farm size');
  }

  if (cropTypes !== undefined && !Array.isArray(cropTypes)) {
    errors.push('Crop types must be an array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export default {
  validateRegistration,
  validateLogin,
  validateDiscussion,
  validateReply,
  validateProfileUpdate
};