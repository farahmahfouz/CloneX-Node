const jwt = require("jsonwebtoken");
const User = require("./../Models/usersModel");
const AppError = require("./../utils/App.Error");

exports.auth = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    throw new AppError("Authorization header is required", 401);
  }
  token = token.split(" ")[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (!payload) {
    throw new AppError("Invalid token", 401);
  }
  const user = await User.findById(payload.id);
  req.user = user;
  next();
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      throw new AppError("You are not Authorized", 401);
    }
    next();
  };
};
