const Post = require('./../Models/postsModel');
const Like = require('../Models/likesModel');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const postSchema = require('../validation/postValidation');

exports.checkID = async (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ status: 'Fail', message: 'Post not found' });
  }
  req.post = post;
  next();
};

exports.getAllPosts = async (req, res) => {
  try {
    // const posts = await Post.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       let: { userId: '$userId' },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $eq: ['$_id', '$$userId']
    //             }
    //           }
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             name: 1,
    //             image: 1
    //           }
    //         }
    //       ],
    //       as: 'user'
    //     }
    //   },
    //   {
    //     $unwind: '$user',
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       content: 1,
    //       images: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //       user: {
    //         _id: '$user._id',
    //         name: '$user.name',
    //         image: '$user.image'
    //       },
    //     },
    //   },
    // ]);

    const posts = await Post.find().populate({
      path: 'userId',
      select: '_id name image',
    });

    if (!posts) {
      throw new AppError('No Posts Found', 404);
    }
    res.status(200).send({
      status: 'success',
      message: 'All Posts retrieved successfully',
      data: { posts },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = req.post;

    // Get likes with user details
    const likes = await Like.aggregate([
      {
        $match: { postId: post._id },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
          },
        },
      },
    ]);

    res.status(200).json({
      ...post.toObject(),
      likesWithUsers: likes,
      totalLikes: likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserPost = async (req, res) => {
  try {
    const id = req.user._id;
    const posts = await Post.find({ userId: id }).populate('userId', 'name');

    res.status(200).send({
      status: 'success',
      message: 'Posts of Currently user retrieved successfully',
      data: { posts },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body, { abortEarly: true });
    if (error) return next(new AppError(error.details[0].message, 400));

    const images = req.body.images || [];

    const id = req.user._id;
    const { content } = req.body;
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
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    const images = Array.isArray(req.body.images) ? req.body.images : [];
    const post = req.post;

    if (post.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to update this post', 403);
    }
    if (!content && images.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field (content or images) is required',
      });
    }

    if (content) post.content = content;
    if (images.length > 0) post.images = images;

    // const updatePost = await Post.findByIdAndUpdate(
    //   postId,
    //   { content, images },
    //   { new: true }
    // );

    await post.save();

    res.status(200).send({
      status: 'success',
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('No Post Found By This ID', 404);
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to delete this post', 403);
    }
    const deletePost = await Post.findByIdAndDelete(postId);

    if (!deletePost) {
      throw new AppError('No Post Found By This ID', 404);
    }
    res.status(204).send({
      status: 'success',
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};
