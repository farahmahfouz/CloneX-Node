const Like = require("../Models/likesModel");
const AppError = require("../utils/App.Error");
const mongoose = require("mongoose");

exports.addLike = async (req, res, next) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const userId = req.user._id;

    const like = await Like.findOne({ postId, userId });

    if (like) {
      return res.status(400).send({ message: "You have already liked this post." });
    }

    const newLike = await Like.create({ postId, userId });

    res.status(201).send({
      message: "Like added successfully.",
      like: newLike,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error." });
  }
};

exports.removeLike = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    console.log('PostID', postId)
    const userId = req.user;
    console.log('UserId', userId)
    const like = await Like.findOneAndDelete({ postId, userId });

    if (!like) {
      throw new AppError("Like not found", 404);
    }

    res.status(200).send({ message: "Like removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error." });
  }
};
