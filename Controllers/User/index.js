const { generateToken, ApiResponse } = require("../../Helpers");
const User = require("../../Models/User");
const bcrypt = require("bcrypt");
const moment = require("moment");
const fs = require("fs");

// Signup Controller
exports.signup = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json(ApiResponse({}, "A User with this Email Already Exists", false));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user = new User({
      ...req.body,
      password: hashedPassword,
    });
    const token = generateToken(user);
    await user.save();
    res
      .status(200)
      .json(
        ApiResponse(
          { user, token },
          "Your Account has been created Successfully",
          true
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Login Controller for User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "No User Found With this Email", false));
    }
    if (user?.status === "INACTIVE") {
      return res
        .status(400)
        .json(ApiResponse({}, "Your Account is made Inactive by Admin", false));
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res
        .status(401)
        .json(ApiResponse({}, "Invalid Credentials", false));
    }
    const token = generateToken(user);

    await user.save();
    res
      .status(200)
      .send(ApiResponse({ token, user }, "Logged In Successfully", true));
  } catch (error) {
    console.log(error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Get All Users Controller
exports.getUsers = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  let finalAggregate = [];
  finalAggregate.push({
    $sort: {
      createdAt: -1,
    },
  });
  finalAggregate.push({
    $match: {
      _id: { $ne : req.user._id }, // Exclude the current user
    },
  });

  finalAggregate.push({
    $project: {
      firstName: 1,
      lastName: 1,
      email: 1,
      image: {
        $cond: {
          if: { $eq: ["$isPrivate", true] },
          then: null,
          else: "$image",
        },
      },
      gallery: {
        $cond: {
          if: { $eq: ["$isPrivate", true] },
          then: null,
          else: "$image",
        },
      },
      gender: 1,
    },
  });

  const myAggregate =
    finalAggregate.length > 0
      ? User.aggregate(finalAggregate)
      : User.aggregate([]);
  User.aggregatePaginate(myAggregate, { page, limit })
    .then((users) => {
      res
        .status(200)
        .json(ApiResponse(users, `${users.docs.length} users found`, true));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(ApiResponse({}, err.message, false));
    });
};

// Get User By ID Controller
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  try {
    if (!user) {
      return res.status(404).json(ApiResponse({}, "User Not Found", false));
    }
    if (user.isPrivate) {
      // modify the response to not include images
      const { image, gallery, ...userData } = user.toObject();
      return res.status(200).json(ApiResponse(userData, "Success", true));
    }
    res.status(200).json(ApiResponse(user, "Success", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.editProfile = async (req, res) => {
  let user = await User.findById(req.user._id);
  try {
    if (!user) {
      return res.status(404).json(ApiResponse({}, "Account not found", false));
    }
    let oldImages = req.body.oldImages ? JSON.parse(req.body.oldImages) : [];
    let galleryImages = [];
    user.firstName = req.body.firstName ? req.body.firstName : user.firstName;
    user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
    user.gender = req.body.gender ? req.body.gender : user.gender;
    user.isPrivate = req.body.isPrivate ? req.body.isPrivate : user.isPrivate;
    if (req.files.image) {
      if (user.image) {
        const imagePath = `./Uploads/${user.image}`;
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Old image deleted successfully");
        }
      }
      user.image = req.files.image[0].filename;
    }
    let temp = req.files.gallery
      ? req.files.gallery.map((image) => {
          return image.filename;
        })
      : [];

    galleryImages = [...temp, ...oldImages, ...user.gallery];
    if (oldImages && oldImages.length > 0) {
      oldImages.map((item) => {
        const filePath = `./Uploads/${item}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    user.gallery = galleryImages.filter((image) => {
      return !oldImages.includes(image);
    });
    await user.save();
    res
      .status(200)
      .json(ApiResponse(user, "profile details updated successfully", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteImages = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json(ApiResponse({}, "User ID is required", false));
  }
  let user = await User.findById(req.params.id);
  try {
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "User Account not found", false));
    }
    if (user.image) {
      const imagePath = `./Uploads/${user.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        user.image = "";
      }
    }
    if (user.gallery) {
      user.gallery.forEach((image) => {
        const filePath = `./Uploads/${image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      user.gallery = [];
    }
    res.status(200).json(ApiResponse({}, "Images deleted successfully", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { userType } = req.query;

    const query = { isAdmin: false };
    if (userType) {
      query.userType = userType;
    }

    const leadUsers = await User.find(query).sort({ score: -1 }).limit(10);

    return res
      .status(200)
      .json(ApiResponse(leadUsers, "Leaderboard fetched successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal Server Error", false));
  }
};
