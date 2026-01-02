const express = require("express");
const userModel = require("../../user/model/user.model");
const catchAsync = require("../../utils/catchAsync");
const { AppError } = require("../../utils/appError");
const helper = require("../../helper");
const mongoose = require("mongoose");
const Admin = require("../models/admin.model");
const Role = require("../models/role.model");
const extractFile = require("../../utils/file");
const router = express.Router();
const { sendPaginated, sendData } = require("../../utils/response");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = req.query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
  const skip = (page - 1) * limit;

  const filter = req.query.filter || "";
  const active = req.query.active || null;

  // Build the filter query
  const filters = {};

  if (active) {
    if (active === "true") {
      filters.active = true;
    } else if (active === "false") {
      filters.active = false;
    }
  }

  if (filter) {
    filters.$or = [{ name: { $regex: filter, $options: "i" } }];
  }

  // Prepare the main query
  const query = userModel
    .find(filters)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  // Fetch data and total count in parallel
  const [data, totalCount] = await Promise.all([
    query.exec(),
    userModel.countDocuments(filters),
  ]);

  const pages = Math.max(Math.ceil(totalCount / limit), 1);

  sendPaginated(
    res,
    data,
    { page, limit, total: totalCount, pages },
    "Users data fetched successfully"
  );
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const query = userModel.findOne({
    _id: req.params.id,
    active: true,
  });

  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  sendData(res, doc, "User retrieved successfully");
});

exports.changeUserStatus = helper.updateOne(userModel);

exports.getUserRegistrationStats = catchAsync(async (req, res, next) => {
  // Get total users count
  const totalUsers = await userModel.countDocuments();
  
  // Get active users count
  const activeUsers = await userModel.countDocuments({ active: true });
  
  // Get users registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await userModel.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Get users registered in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyUsers = await userModel.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });
  
  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    recentUsers,
    weeklyUsers
  };
  
  sendData(res, stats, "User registration statistics retrieved successfully");
});
