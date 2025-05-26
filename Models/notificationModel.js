const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'repost', 'follow'],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: '_id name image',
  })
    .populate({
      path: 'post',
      select: '_id content',
    })
    .populate({
      path: 'comment',
      select: '_id text',
    });
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 