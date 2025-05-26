const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getAllLikes,
  likePost,
  unlikePost,
} = require('../Controllers/likesController');
const { auth } = require('../Middlewares/authMiddleware');

router.use(auth);

router.get('/', getAllLikes);
router.post('/', likePost);
router.delete('/', unlikePost);

module.exports = router;
