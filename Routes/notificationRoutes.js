const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  deleteNotification,
} = require('../Controllers/notificationController');
const { auth } = require('../Middlewares/authMiddleware');

router.use(auth);

router.get('/', getUserNotifications);
router.patch('/mark-read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router; 