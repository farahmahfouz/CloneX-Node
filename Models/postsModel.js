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
  }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: '_id name image',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
