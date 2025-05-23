const User = require('./../Models/usersModel');
const Post = require('./../Models/postsModel');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken } = require('../utils/jwt');

exports.getMe = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }
  req.params.id = req.user._id;
  next();
};

const filteredObject = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
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

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password. Please use /updateMyPassword',
        400
      )
    );
  const filteredBody = filteredObject(req.body, 'name', 'email', 'bio', 'location', 'website');


  if (req.body.image) {
    filteredBody.image = Array.isArray(req.body.image) ? req.body.image[0] : req.body.image;
  }

  if (req.body.coverImage) {
    filteredBody.coverImage = Array.isArray(req.body.coverImage) ? req.body.coverImage[0] : req.body.coverImage;
  }

  const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).send({
    status: 'success',
    data: { user: updateUser },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  user.password = req.body.password;
  await user.save();

  const token = signAccessToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    // secure: true,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;
  res.status(201).json({
    status: 'success',
    data: { user },
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
