const { body, validationResult, check } = require("express-validator");
const { ApiResponse } = require("../../Helpers");

// Add New User Validator
exports.signupValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("firstName").not().isEmpty().withMessage("First Name is Required"),
  body("lastName").not().isEmpty().withMessage("Last Name is Required"),
  body("password").not().isEmpty().withMessage("Password is Required"),
  body("gender")
    .not()
    .isEmpty()
    .withMessage("Gender is Required")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender value"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next();
  },
];

// Login User Validator
exports.loginValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("password").not().isEmpty().withMessage("Password is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next();
  },
];
