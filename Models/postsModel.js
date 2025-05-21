const mongoose = require('mongoose');
const Like = require('./likesModel');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    images: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.statics.attachedIsLiked = async function (posts, userId) {
  if (!Array.isArray(posts)) posts = [posts];

  let likedPostIds = [];
  if (userId) {
    const likes = await Like.find({
      user: userId,
      post: { $in: posts.map((p) => p._id) },
    });
    likedPostIds = likes.map((like) => +like.post);
  }

  return posts.map((post) => ({
    ...post.toObject(),
    isLiked: likedPostIds.includes(+post._id),
  }));
};

postSchema.virtual('likesCount', {
  ref: 'Like',
  foreignField: 'post',
  localField: '_id',
  count: true,
});

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: '_id name image',
  })
    .populate('likesCount')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: '_id name image',
      },
      select: '-__v'
    });

  this.sort({ createdAt: -1 });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
