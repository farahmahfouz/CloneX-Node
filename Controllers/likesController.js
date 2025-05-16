const Like = require('../Models/likesModel');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');

exports.getAllLikes = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postId) filter = { post: req.params.postId };
  const likes = await Like.find(filter);

  res.status(200).json({
    status: 'success',
    results: likes.length,
    data: { likes },
  });
});


exports.addLike = catchAsync(async (req, res, next) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId);
  const userId = req.user._id;

  const like = await Like.findOne({ post: postId, user: userId });

  if (like) return next(new AppError('You have already liked this post.', 400));

  const newLike = await Like.create({ post: postId, user: userId });

  res.status(201).send({
    message: 'Like added successfully.',
    like: newLike,
  });
});

exports.removeLike = catchAsync(async (req, res, next) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId);
  const userId = req.user._id;

  const like = await Like.findOneAndDelete({ post: postId, user: userId });

  if (!like) return next(new AppError('Like not found', 404));

  res.status(200).send({ message: 'Like removed successfully.' });
});
