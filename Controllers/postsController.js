const { post } = require("../Routes/postsRoutes");
const Post = require("./../Models/postsModel");
// const ObjectId = require('mongodb').OjectId;
const AppError = require("./../utils/App.Error");
const mongoose = require("mongoose");

exports.getAllPosts = async (req, res, next) => {
  const posts = await Post.find();
  if (!posts) {
    throw new AppError("No Posts Found", 404);
  }
  res.status(200).send({
    status: "success",
    data: { posts },
  });
};
exports.getOnePost = async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("No Post Fount with this ID", 404);
  }
  if (post.userId !== req.user) {
    throw new AppError("Unautorized", 403);
  }
  res.status(200).send({
    status: "success",
    data: { post },
  });
};

exports.getUserPost = async (req, res, next) => {
  const id = req.user._id;
  console.log(id);
  const posts = await Post.find({ userId: id });
  res.status(200).send({
    status: "success",
    data: { posts },
  });
};

exports.createPost = async (req, res, next) => {
  const id = req.user._id;
  console.log(id);
  const { content } = req.body;
  const createPost = await Post.create({
    content,
    userId: id,
  });
  res.status(201).send({
    status: "success",
    data: { createPost },
  });
};

exports.updatePost = async (req, res, next) => {
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
    data: { updatePost },
  });
};

exports.deletePost = async (req, res, next) => {
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
    throw new AppError("No Post Found ByThis ID", 404);
  }
  res.status(204).send({
    status: "success",
  });
};
