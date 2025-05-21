const Post = require('../Models/postsModel');
const Comment = require('../Models/commentsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createComment = catchAsync(async (req, res, next) => {
  const postExists = await Post.findById(req.params.postId);
  if (!postExists) return next(new AppError('Post not found', 404));

  const { text } = req.body;
  const comment = await Comment.create({
    text,
    user: req.user._id,
    post: req.params.postId,
  });
  res.status(201).json({
    status: 'success',
    message: 'Comment created successfully',
    data: { comment },
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

exports.deleteComment = catchAsync(async (req, res, next) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully',
    data: null,
  });
});
