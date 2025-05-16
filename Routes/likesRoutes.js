const express = require('express');
const {
  addLike,
  removeLike,
  getAllLikes,
} = require('../Controllers/likesController');
const router = express.Router({ mergeParams: true });

const { auth } = require('../Middlewares/authMiddleware');

router.get('/', getAllLikes);

router.post('/', auth, addLike);

router.delete('/', auth, removeLike);

module.exports = router;
