const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const morgan = require("morgan");

require("dotenv").config();

const { PORT } = process.env;

// app initialize
const app = express();

// db initialize
require("./Config/db");

//register middleware

const coreOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION , params, headers",
  exposedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION , params, headers",
};

app.use(cors(coreOptions));

app.use(morgan("dev"));

app.use(express.json());

var httpsServer = http.createServer(app)


// static routes
app.use("/Uploads", express.static("./Uploads"));

// routes register

app.use("/api", require("./Routes/index"));

app.get("/", (req, res) => {
  res.send("Test Server Running");
});

httpsServer.listen(PORT, () => {
  console.log(`Test backend Listening on port ${PORT}`);
});
