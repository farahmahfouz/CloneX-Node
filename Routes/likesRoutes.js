const express = require('express');
const { addLike, removeLike, setPostsUserIds, getAllLikes } = require('../Controllers/likesController');
const router = express.Router({mergeParams: true});

const { auth } = require('../Middlewares/authMiddleware');

router.get('/', getAllLikes);

router.post('/', auth, setPostsUserIds, addLike);

router.delete('/', auth, removeLike);

module.exports = router;
