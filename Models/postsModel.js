const mongoose = require('mongoose');
const Like = require('./likesModel');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return !this.repost;
      },
    },
    images: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    repost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
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
    likedPostIds = likes.map((like) => like.post.toString());
  }

  return posts.map((post) => ({
    ...post.toObject(),
    isLiked: likedPostIds.includes(post._id.toString()),
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

postSchema.virtual('repostsCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'repost',
  count: true
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: '_id name image email',
  })
    .populate('likesCount')
    // .populate('repostsCount') 
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: '_id name image email',
      },
      select: '-__v',
    })
    .populate({
      path: 'repost',
      populate: {
        path: 'userId',
        select: '_id name image email',
      },
    });

  this.sort({ createdAt: -1 });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
