const Post = require("./../Models/postsModel");
const Like = require("../Models/likesModel");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");
const postSchema  = require("../validation/postValidation");

exports.getAllPosts = async (req, res) => {
  try {
    // const posts = await Post.find().populate("userId", "name");
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
              },
            },
            { $unwind: "$userDetails" },
            {
              $project: {
                _id: 1,
                user: { _id: "$userDetails._id", name: "$userDetails.name" },
              },
            },
          ],
          as: "likesWithUsers",
        },
      },
      {
        $addFields: {
          totalLikes: { $size: "$likesWithUsers" },
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: 1, name: 1 },
          likesWithUsers: 1,
          totalLikes: 1,
        },
      },
    ]);

    if (!posts) {
      throw new AppError("No Posts Found", 404);
    }
    res.status(200).send({
      status: "success",
      message: "All Posts retrieved successfully",
      data: { posts },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get likes with user details
    const likes = await Like.aggregate([
      {
        $match: { postId: mongoose.Types.ObjectId.createFromHexString(postId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
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
    const posts = await Post.find({ userId: id }).populate("userId", "name");

    res.status(200).send({
      status: "success",
      message: "Posts of Currently user retrieved successfully",
      data: { posts },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body, { abortEarly: true });
    if (error) return next(new AppError(error.details[0].message, 400));

    const id = req.user._id;
    const { content } = req.body;
    const createPost = await Post.create({
      content,
      userId: id,
    });

    res.status(201).send({
      status: "success",
      message: "Post created successfully",
      data: { createPost },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("No Post Found By This ID", 404);
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      throw new AppError("Unauthorized to update this post", 403);
    }
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true }
    );

    if (!updatePost) {
      throw new AppError("No Post Found By This ID", 404);
    }
    res.status(200).send({
      status: "success",
      message: "Post updated successfully",
      data: { updatePost },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("No Post Found By This ID", 404);
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      throw new AppError("Unauthorized to delete this post", 403);
    }
    const deletePost = await Post.findByIdAndDelete(postId);

    if (!deletePost) {
      throw new AppError("No Post Found By This ID", 404);
    }
    res.status(204).send({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};
