const Notification = require('../Models/notificationModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createNotification = catchAsync(async (data) => {
  const notification = await Notification.create(data);
  return notification;
});

exports.getUserNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    result: notifications.length,
    data: { notifications },
  });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds)) {
    return next(new AppError('Please provide an array of notification IDs', 400));
  }

  await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: req.user._id,
    },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Notifications marked as read',
  });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
}); 