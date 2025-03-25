const express = require('express');
const { addLike, removeLike } = require('../Controllers/likesController');
const router = express.Router();

const { auth } = require('../Middlewares/authMiddleware');

router.post('/:postId/like', auth, addLike);

router.delete('/:postId/like', auth, removeLike);

module.exports = router;
