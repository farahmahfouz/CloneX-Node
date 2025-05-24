const mongoose = require('mongoose');
const User = require('../Models/usersModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.addFollow = async (req, res, next) => {
  const currentUserId = req.user._id;
  const userIdToFollow = req.params.id;

  if (currentUserId.toString() === userIdToFollow.toString()) {
    return next(new AppError("You can't follow yourself!", 400));
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userToFollow = await User.findOneAndUpdate(
      { _id: userIdToFollow, followers: { $ne: currentUserId } },
      { $addToSet: { followers: currentUserId } },
      { new: true, session }
    ).select('name image followers');

    if (!userToFollow) {
      await session.abortTransaction();
      return next(new AppError('User not found or already followed!', 404));
    }

    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { following: userIdToFollow } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      user: {
        id: userToFollow._id,
        name: userToFollow.name,
        image: userToFollow.image,
        followersCount: userToFollow.followers.length,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.unFollow = async (req, res, next) => {
  const currentUserId = req.user._id;
  const userIdToFollow = req.params.id;

  if (currentUserId.toString() === userIdToFollow.toString()) {
    return next(new AppError("You can't follow yourself!", 400));
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userToFollow = await User.findOneAndUpdate(
      { _id: userIdToFollow, followers: currentUserId },
      { $pull: { followers: currentUserId } },
      { new: true, session }
    ).select('name image followers');

    if (!userToFollow) {
      await session.abortTransaction();
      return next(new AppError('User not found or already followed!', 404));
    }

    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: userIdToFollow } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      user: {
        id: userToFollow._id,
        name: userToFollow.name,
        image: userToFollow.image,
        followersCount: userToFollow.followers.length,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.getMyFollowStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select('following followers')
    .populate('following', 'name image')
    .populate('followers', 'name image');

  res.status(200).json({
    status: 'success',
    data: {
      following: user.following,
      followers: user.followers,
      followingCount: user.following.length,
      followersCount: user.followers.length,
    },
  });
});

exports.getUserFollowStats = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId)
    .select('following followers')
    .populate('following', 'name image')
    .populate('followers', 'name image');

  if (!user) return next(new AppError('User not found!', 404));

  res.status(200).json({
    status: 'success',
    data: {
      following: user.following,
      followers: user.followers,
      followingCount: user.following.length,
      followersCount: user.followers.length,
    },
  });
});
