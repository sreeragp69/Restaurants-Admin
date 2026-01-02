const Role = require("../models/role.model");
const authController = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();
const catchAsync = require("../../utils/catchAsync");
const { AppError } = require("../../utils/appError");
const mongoose = require("mongoose");

router.get(
  "/getAll-roles",
  authController.protect,
  catchAsync(async (req, res, next) => {
    const { status } = req.query;
    let query = {};

    if (status === "true") {
      query.status = true;
    } else if (status === "false") {
      query.status = false;
    }

    const features = Role.find(query);
    const data = await features;

    if (!data) {
      return next(new AppError("No document found", 404));
    }
    res.status(200).json({
      status: "success",
      results: data.length,
      data: data,
    });
  })
);

router.get(
  "/get-role/:id",
  authController.authenticate,
  catchAsync(async (req, res, next) => {
    await Role.findById(req.params.id)
      .then((data) => {
        if (!data) {
          return next(new AppError("Not found with id " + req.params.id, 404));
        }
        res.status(200).json(data);
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          return next(new AppError("Not found with id" + req.params.id, 404));
        }
        return next(
          new AppError("Error retrieving data with id" + req.params.id, 501)
        );
      });
  })
);

router.post(
  "/create-role",
  // authController.protect,
  catchAsync(async (req, res, next) => {
    const existData = await Role.findOne({ roleName: req.body.roleName });

    if (existData) {
      return next(new AppError("This role has been already exist!", 404));
    }

    const newData = await Role.create({
      roleName: req.body.roleName,
      rolePermissions: req.body.rolePermissions,
    });

    if (!newData) {
      return next(new AppError("Data not Created", 404));
    }

    res.status(200).json({
      status: "success",
      data: newData,
    });
  })
);

router.post(
  "/update-role/:id",
  authController.protect,
  catchAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid Id " + " " + req.params.id, 400));
    }
    let updateData = [];
    updateData = await Role.findOneAndUpdate(
      { _id: req.params.id },
      {
        roleName: req.body.roleName,
        rolePermissions: req.body.rolePermissions,
      },
      { new: true }
    );

    if (!updateData) {
      return next(new AppError("Not updated!", 404));
    }

    res.status(200).json({
      status: "success",
      data: updateData,
    });
  })
);

router.post(
  "/delete-role/:id",
  authController.protect,
  catchAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid Id " + " " + req.params.id, 400));
    }
    Role.findByIdAndRemove(req.params.id)
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
  "/deactivate/role/:id",
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid Id: ${id}`, 400));
    }

    const newStatus = req.body.status;

    if (typeof newStatus !== "boolean") {
      return next(
        new AppError(
          `Invalid status: ${newStatus}. Status must be a boolean value.`,
          400
        )
      );
    }

    const updatedUser = await Role.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!updatedUser) {
      return next(new AppError(`Could not update user with id: ${id}`, 404));
    }

    const message = newStatus ? "Activate" : "Deactivate";
    return res.status(200).json({ message });
  })
);

module.exports = router;
