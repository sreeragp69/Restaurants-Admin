const express = require("express");
const authController = require("../controllers/auth.controller");
const helper = require("../../helper");
const Admin = require("../models/admin.model");
const Role = require("../models/role.model");
const catchAsync = require("../../utils/catchAsync");
const { AppError } = require("../../utils/appError");
const extractFile = require("../../utils/file");
const mongoose = require("mongoose");
const { handleUploads } = require("../../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/create/user",
  authController.protect,
  handleUploads([{ name: "profile_image", maxCount: 1 }], Admin),
  authController.userRegistration
);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/reset/:token", authController.resetPassword);

router.get(
  "/getAll/users",
  authController.protect,
  authController.getAllPersona
);

router.get("/permissions/:id", authController.getPermissions);

router.put(
  "/update/profile",
  authController.protect,
  // helper.uploadAndResizeImage("profile_image", "user"),
  handleUploads([{ name: "profile_image", maxCount: 1 }], Admin),
  authController.uploadProfilePic
);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.get(
  "/getMe",
  authController.protect,
  authController.getMe,
  authController.getDataById
);

router.get(
  "/get-profile/:id",
  authController.protect,
  authController.getDataById
);

router.patch(
  "/updateMe",
  authController.protect,
  handleUploads(
    [
      { name: "profile_image", maxCount: 1 },
    ],
    Admin
  ),
  authController.updateMe
);

router.post(
  "/changeStatus/:id",
  authController.authenticate,
  authController.update
);

router.delete("/deleteMe", authController.authenticate, authController.delete);

router.post(
  "/delete/user/:id",
  authController.protect,
  catchAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid Id " + " " + req.params.id, 400));
    }
    Admin.findByIdAndRemove(req.params.id)
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: "not found with id " + req.params.id,
          });
        }
        res.send({ id: req.params.id, message: "deleted successfully!" });
      })
      .catch((err) => {
        if (err.kind === "ObjectId" || err.name === "NotFound") {
          return res.status(404).send({
            message: "not found with id " + req.params.id,
          });
        }
        return res.status(500).send({
          message: "Could not delete  with id " + req.params.id,
        });
      });
  })
);

router.post(
  "/update/user/:id",
  authController.protect,
  helper.uploadAndResizeImage("profile_image", "user"),
  catchAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid Id " + req.params.id, 400));
    }

    const { name, email, role, phone } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return next(new AppError("No document found with that ID", 404));
    }

    let profile_image = admin.profile_image;

    if (req.file) {
      profile_image = process.env.IMGURL + req.body.profile_image;
    }

    // Find role details
    const roleDetails = await Role.findById(role);
    if (!roleDetails) {
      return next(new AppError("Invalid role ID!", 400));
    }

    const roleName = roleDetails.roleName;

    // Prepare updated data
    const updatedAdminData = {
      email,
      name,
      role,
      roleName,
      phone,
      profile_image,
    };

    // Update the admin details
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updatedAdminData,
      {
        new: true, // Return the newly updated document
      }
    );

    if (!updatedAdmin) {
      return next(new AppError("No document found with that ID", 404));
    }

    // Send the updated data in response
    res.status(200).json({
      status: "success",
      data: updatedAdmin,
    });
  })
);

module.exports = router;
