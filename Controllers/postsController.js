const Post = require("./../Models/postsModel");
const AppError = require("./../utils/App.Error");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name");
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

exports.getOnePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate("userId", "name");

    if (!post) {
      throw new AppError("No Post Found with this ID", 404);
    }

    res.status(200).send({
      status: "success",
      message: "Post retrieved successfully",
      data: { post },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
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
