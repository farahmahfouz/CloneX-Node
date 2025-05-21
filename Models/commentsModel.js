const mongoose = require('mongoose');

const commentShema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentShema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '_id name image',
  });
  next();
});

const Comment = mongoose.model('Comment', commentShema);

module.exports = Comment;
