const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../../Validators/userValidator");
const {
  signup,
  login,
  getUsers,
  getUserById,
  editProfile,
  deleteImages,
} = require("../../Controllers/User");
const { userRoute } = require("../../Middlewares");
const { uploadMultiple } = require("../../Middlewares/upload");
const router = express.Router();

router.post("/signup", signupValidator, signup); // http://localhost:3014/api/user/signup
router.post("/login", loginValidator, login); // http://localhost:3014/api/user/login
router.get("/getUsers", userRoute,  getUsers); // http://localhost:3014/api/user/getUsers
router.get("/getUser/:id",  userRoute,getUserById); // http://localhost:3014/api/user/getUser/:id
router.put("/editProfile", uploadMultiple, userRoute, editProfile); // http://localhost:3014/api/user/editProfile
router.delete("/deleteImages/:id", userRoute, deleteImages); // http://localhost:3014/api/user/editProfile

module.exports = router;
