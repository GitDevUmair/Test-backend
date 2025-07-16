var jwt = require("jsonwebtoken");
// const Session = require("../Models/otherModels/Session");s
require("dotenv").config();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require('qrcode');
// Api Response Fixed Pattern
exports.ApiResponse = (data = {}, message = "", status = false) => {
  return {
    status: status,
    message: message,
    data: data,
  };
};
// Generate token for login
exports.generateToken = (user) => {
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};


