// const { Router } = require("express");
const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getOnePost,
  createPost,
  updatePost,
  deletePost,
  getUserPost,
} = require("./../Controllers/postsController");
const { auth } = require("../Middlewares/authMiddleware");

router.get("/me", getAllPosts);
router.get("/me", auth, getUserPost);
router.post("/me", auth, createPost);
router.get("/:id",getOnePost);
router.patch("/:id",auth, updatePost);
router.delete("/:id",auth ,deletePost);

module.exports = router;
