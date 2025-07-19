const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  console.log('Registration request body:', req.body);

  // Required fields
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  if (!password) {
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

  // Phone validation (optional)
  if (req.body.phone) {
    // Remove all non-digit characters except leading +
    const cleanedPhone = req.body.phone.replace(/[^\d+]/g, '');
    
    // Check if it's a valid international or local number
    // International format: + followed by 10-15 digits (including country code)
    // Local format: 10-15 digits (no +)
    if (!/^(\+?\d{10,15})$/.test(cleanedPhone)) {
      errors.push('Please enter a valid phone number (e.g., +254114470768 or 0114470768)');
    } else {
      // Store cleaned phone number in the request for later use
      req.body.phone = cleanedPhone;
    }
  }

  console.log('Validation errors:', errors);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
  }

  next();
};

const validateOTP = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!otp || !otp.trim()) {
    errors.push('OTP is required');
  } else if (!/^AGRI-\d{6}$/.test(otp)) {
    errors.push('Invalid OTP format. Expected format: AGRI-123456');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateOTP
};