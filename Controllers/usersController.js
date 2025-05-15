const User = require('./../Models/usersModel');
const Post = require('./../Models/postsModel');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');


exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  if (!users) return next(new AppError('No users Found', 404));

  res.status(200).send({
    status: 'success',
    message: 'Users retrieved successfully',
    data: { users },
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select('-password');
  if (!user) return next(new AppError('No User Found', 404));

  res.status(200).send({
    status: 'success',
    message: 'User retrieved successfully',
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  const updateUser = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true }
  );
  if (!updateUser) return next(new AppError('User Not Found with This ID', 404));
  
  res.status(200).send({
    status: 'success',
    data: { updateUser },
  });
});

exports.deleteUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.params.id;
    // 1. Update user to be inactive
    await User.findByIdAndUpdate(userId, { active: false }, { session });
    // 2. Delete all posts by that user
    await Post.deleteMany({ userId }, { session });
    // 3. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      status: 'success',
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

