const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setTokenCookie = (response, userId) => {
  const token = jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  response.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: COOKIE_MAX_AGE,
  });
};

const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body || {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
    });

    setTokenCookie(res, user._id);
    return res.status(201).json({
      message: 'Registration successful.',
      user: getSafeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const passwordMatches = user && await user.matchPassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    setTokenCookie(res, user._id);
    return res.status(200).json({
      message: 'Login successful.',
      user: getSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  return res.status(200).json({ message: 'Logout successful.' });
};

const getMe = (req, res) => {
  return res.status(200).json({ user: getSafeUser(req.user) });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
