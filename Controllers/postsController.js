const Post = require('./../Models/postsModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const isPostOwner = (postUserId, currentUserId) =>
  postUserId.toString() === currentUserId.toString();

exports.getAllPosts = catchAsync(async (req, res) => {
  const posts = await Post.find();
  if (!posts) {
    throw new AppError('No Posts Found', 404);
  }
  res.status(200).send({
    status: 'success',
    message: 'All Posts retrieved successfully',
    data: { posts },
  });
});

exports.getPostById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError('No Post Found', 404);
  }
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

exports.getUserPost = catchAsync(async (req, res) => {
  const id = req.user._id;
  const posts = await Post.find({ userId: id });

  res.status(200).send({
    status: 'success',
    message: 'Posts of Currently user retrieved successfully',
    data: { posts },
  });
});

exports.createPost = catchAsync(async (req, res) => {
  const id = req.user._id;
  const { content, images } = req.body;
  const createPost = await Post.create({
    content,
    userId: id,
    images,
  });

  res.status(201).send({
    status: 'success',
    message: 'Post created successfully',
    data: { createPost },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const { content, images } = req.body;

  const post = await Post.findById(postId);

  if (!post) return next(new AppError('Post not found', 404));

  if (!isPostOwner(post.userId, req.user._id))
    return next(new AppError('Unauthorized to update this post', 403));

  const updatePost = await Post.findByIdAndUpdate(
    postId,
    { content, images },
    { new: true }
  );

  res.status(200).send({
    status: 'success',
    message: 'Post updated successfully',
    data: { updatePost },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (!post) return next(new AppError('No Post Found By This ID', 404));

  if (!isPostOwner(post.userId, req.user._id)) {
    return next(new AppError('Unauthorized to delete this post', 403));
  }

  await Post.findByIdAndDelete(postId);

  res.status(204).send({
    status: 'success',
    message: 'Post deleted successfully',
  });
});
