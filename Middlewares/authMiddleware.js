const jwt = require('jsonwebtoken');
const User = require('./../Models/usersModel');
const AppError = require('../utils/AppError');

exports.auth = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    throw new AppError('Authorization header is required', 401);
  }

  token = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      throw new AppError('Invalid token', 401);
    }

    const user = await User.findById(payload.id);

    if (!user) {
      throw new AppError('Unauthorized', 401);
    }
    if (user.changePasswordAfter(payload.iat)) {
      return next(
        new AppError('Password recently changed. Please log in again', 401)
      );
    }
    req.user = user;
  } catch (err) {
    req.user = undefined;
  }
  next();
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      throw new AppError('You are not Authorized', 401);
    }
    next();
  };
};
