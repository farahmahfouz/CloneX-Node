const Post = require('../Models/postsModel');
const Comment = require('../Models/commentsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');

exports.addComment = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const { text } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const comment = await Comment.create({
    text,
    post: postId,
    user: userId,
  });

  // Don't create notification if user comments on their own post
  if (post.userId.toString() !== userId.toString()) {
    const notification = await createNotification({
      recipient: post.userId,
      sender: userId,
      type: 'comment',
      post: postId,
      comment: comment._id,
    });

    // Emit notification to the post owner
    req.app.get('io').to(post.userId.toString()).emit('notification', notification);
  }

  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

exports.getPostComments = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const comments = await Comment.find({ post: postId });

  res.status(200).json({
    status: 'success',
    data: { comments },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user._id;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId,
  });

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postId) filter = { post: req.params.postId };

  const comments = await Comment.find(filter);
  if (!comments) next(new AppError('Comments not found!', 404));

  res.status(200).json({
    status: 'success',
    message: 'Comments retrieved successfully',
    data: { comments },
  });
});

exports.getCommentById = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) return next(new AppError('Comment not found!', 404));

  res.status(200).json({
    status: 'success',
    message: 'Comment retrieved successfully',
    data: { comment },
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new AppError('Comment not found!', 404));

  if (!comment.user.equals(req.user._id)) {
    return next(
      new AppError('You are not authorized to modify this comment', 403)
    );
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    { text: req.body.text },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Comment updated successfully',
    data: { comment: updatedComment },
  });
});
