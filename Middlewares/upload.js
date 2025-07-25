const multer = require("multer");
const path = require("path");
const { ApiResponse } = require("../Helpers/index");

const fileTypes = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/pdf",
  ],
};


const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    req.body.image = uniqueSuffix + path.extname(file.originalname);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const multiStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

exports.uploadFile = function (req, res, next) {
  var upload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/webp"
      ) {
        cb(null, true);
      } else if (!file) {
        cb(null, false);
        next();
      } else {
        cb(new Error("Image File Type not Allowed"), false);
      }
    },
  }).single("image");

  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json(ApiResponse({}, err.message, false));
    }
    next();
  });
};

const uploadMultiple = multer({
  storage: multiStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else if (!file) {
      cb(null, false);
      next();
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

exports.uploadMultiple = uploadMultiple.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);


const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let fileName = uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const uploadFiles = multer({
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    let { fieldname, mimetype } = file;
    if (
      (fieldname === "file" && fileTypes.document.includes(mimetype))
    ) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

exports.uploadFiles = uploadFiles.fields([
  { name: "file", maxCount: 1 },
]);