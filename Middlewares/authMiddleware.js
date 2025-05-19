const jwt = require('jsonwebtoken');
const User = require('./../Models/usersModel');
const AppError = require('../utils/AppError');

exports.auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return next(new AppError('Authorization header is required', 401));
    }

    token = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return next(new AppError('Invalid token', 401));
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    if (user.changePasswordAfter(payload.iat)) {
      return next(
        new AppError('Password recently changed. Please log in again', 401)
      );
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return next(new AppError('Authentication failed', 401));
  }
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      return next(new AppError('You are not Authorized', 401));
    }
    next();
  };
};
