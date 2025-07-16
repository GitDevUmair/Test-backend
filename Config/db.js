const mongoose = require("mongoose");
require("dotenv").config();

const {  DB_ATLAS, NODE_ENV } = process.env;
const DB = {
  development: DB_ATLAS,
};
mongoose
  .connect(DB[NODE_ENV])
  .then((res) => {
    console.log(`Connected to Database Successfully `);
  })
  .catch((err) => {
    console.log("Error in Database Connection", err);
  });

module.exports = mongoose;
