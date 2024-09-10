// const { Router } = require("express");
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getOneUser,
  signup,
  login,
  updateUser,
  deleteUser,
} = require("./../Controllers/usersController");
const { auth } = require("./../Middlewares/authMiddleware");


router.get("/", getAllUsers);
router.get("/:id", getOneUser);
router.post("/signup", signup);
router.post("/login", login);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
