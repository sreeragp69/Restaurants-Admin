const path = require("path");
const fs = require("fs");
const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const { AppError } = require("./utils/appError");
const GlobalError = require("./utils/errorController");

const AdminRoutes = require("./admin/router/mainRouter");
const UserRouter = require("./user/router/mainRouter");
const sanitizeMiddleware = require("./middlewares/sanitize.middleware");


const app = express();

app.enable("trust proxy");

app.use(cors());

app.options("*", cors());

const DIST_DIR = path.join(__dirname, "dist");
app.use(express.static(DIST_DIR));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/img/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;

  const filePath = path.join(__dirname, "images", folder, filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File not found:", err);
      res.status(404).json({ error: "File not found" });
    }
  });
});

app.get("/api/file/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);
  res.sendFile(filePath);
});

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/", cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use("/", compression());

app.use(sanitizeMiddleware());

// Test middleware
app.use("/", (req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

//------------------------- END ----------------------------//

// 3) ROUTES
app.use("/api/v1/mmorpg", AdminRoutes, UserRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(GlobalError);

module.exports = app;
