const mongoose = require('mongoose');

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

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: '_id name image',
  }).populate('likesCount');
  next();
});

postSchema.virtual('likesCount', {
  ref: 'Like',
  foreignField: 'post',
  localField: '_id',
  count: true
});


postSchema.pre(/^find/, function (next) {
  this.sort({ createdAt: -1 });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
