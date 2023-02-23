const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const connectDB = require("./db/connectDB");
const routes = require("./routes/routes");

const { initPayment, responsePayment } = require("./paytm/services/index");

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("views", path.join(__dirname, "/view"));
app.set("view engine", "ejs");

// Database
connectDB();

// Routes
app.use("/", routes);

// Error Handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: err.message });
});

// Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
