const Like = require('../Models/likesModel');
const Post = require('../Models/postsModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { createNotification } = require('./notificationController');

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

exports.likePost = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.userId.toString() !== userId.toString()) {
    const notification = await createNotification({
      recipient: post.userId,
      sender: userId,
      type: 'like',
      post: postId,
    });

    req.app.get('io').to(post.userId.toString()).emit('notification', notification);
  }

  const like = await Like.create({
    post: postId,
    user: userId,
  });

  res.status(201).json({
    status: 'success',
    data: { like },
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const like = await Like.findOneAndDelete({
    post: postId,
    user: userId,
  });

  if (!like) {
    return next(new AppError('Like not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
