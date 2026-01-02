const express = require("express");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const helper = require("../../helper");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/users", authController.authenticate, userController.getAllUsers);

router.get(
  "/users/:id",
  authController.authenticate,
  userController.getUserById
);

router.post(
  "/changeUserStatus/:id",
  authController.authenticate,
  userController.changeUserStatus
);

router.get(
  "/users/statistics/registrations",
  authController.authenticate,
  userController.getUserRegistrationStats
);

module.exports = router;
