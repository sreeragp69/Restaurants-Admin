const User = require("../model/user.model");
const UserReport = require("../model/userReport.model");
const catchAsync = require("../../utils/catchAsync");
const { createError } = require("../../utils/appError");
const helper = require("../../helper");
const helperFunction = require("../../middlewares/helper");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.userRegistration = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.name || !req.body.password) {
    const missingFields = [];
    if (!req.body.email) missingFields.push("email");
    if (!req.body.name) missingFields.push("name");
    if (!req.body.password) missingFields.push("password");

    return next(
      createError.validation(
        `Missing required fields: ${missingFields.join(", ")}`
      )
    );
  }

  // Check if user already exists
  let existingData = await User.findOne({ email: req.body.email });

  if (existingData) {
    return next(createError.conflict("User already exists."));
  }

  // Create new user
  const newData = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    country: req.body.country || null,
    code: req.body.code || null,
    language: req.body.language || null,
    deviceId: req.body.deviceId || null,
    fcmToken: req.body.fcmToken || null,
    xp: req.body.xp || 0,
    goldCoin: req.body.goldCoin || 0,
    germsCoin: req.body.germsCoin || 0,
    transmogCoin: req.body.transmogCoin || 0,
  });

  if (!newData) {
    return next(createError.internal("User creation process failed!"));
  }

  res.status(201).json({
    status: "success",
    message: "Registration Succesfully Done",
    data: newData,
  });
});

// User Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, deviceId, fcmToken } = req.body;

  if (!email || !password) {
    return next(createError.validation("Please provide email and password!"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(createError.unauthorized("Incorrect email or password"));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(createError.unauthorized("Incorrect email or password"));
  }

  user.login_time = helperFunction.unixTimestamp();
  user.deviceId = deviceId;
  user.fcmToken = fcmToken;
  await user.save({ validateBeforeSave: false });

  helper.createClientSendToken(user, 200, req, res);
});

// User Profile
exports.getUserProfile = catchAsync(async (req, res, next) => {
  // Fetch the user by their ID and populate languages and genre
  const user = await User.findById(req.user.id);

  // If the user is not found
  if (!user) {
    return next(createError.notFound("User not found."));
  }

  // Respond with the user data
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Update User Profile
exports.updateUserProfile = catchAsync(async (req, res, next) => {
  // Validate required fields
  if (!req.body.name && !req.body.deviceId && !req.body.fcmToken) {
    return next(createError.validation("No fields provided for update."));
  }

  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(createError.notFound("User not found."));
  }

  // Update only the fields that are allowed and provided
  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.deviceId) updateData.deviceId = req.body.deviceId;
  if (req.body.fcmToken) updateData.fcmToken = req.body.fcmToken;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(createError.internal("User update failed!"));
  }

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// Update Password
exports.updateUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(createError.notFound("User not found."));
  }

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      createError.unauthorized("Your current password is incorrect.")
    );
  }

  user.password = req.body.password;
  await user.save();
  helper.createClientSendToken(user, 200, req, res);
});

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(createError.validation("Please provide your phone number!"));
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return next(
      createError.notFound("User with this phone number does not exist.")
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 15 * 60 * 1000;
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  try {
    await helperFunction.sendSmsDigimiles(phone, otp);
  } catch (err) {
    return next(createError.internal("Failed to send OTP. Please try again."));
  }

  return res.status(200).json({
    status: "success",
    message: "OTP sent successfully.",
  });
});

// Social Login - Google
exports.socialLoginGoogle = catchAsync(async (req, res, next) => {
  const { email, name, deviceId, fcmToken } = req.body;

  if (!email) {
    return next(createError.validation("Email is required for Gmail login!"));
  }

  let user = await User.findOne({ email });

  if (!user) {
    // Create a new user
    user = await User.create({
      name: name,
      email: email,
      deviceId: deviceId || null,
      fcmToken: fcmToken || null,
      xp: req.body.xp || 0,
      goldCoin: req.body.goldCoin || 0,
      germsCoin: req.body.germsCoin || 0,
      transmogCoin: req.body.transmogCoin || 0,
    });
  }

  // Generate and send the token
  helper.createClientSendToken(user, 200, req, res);
});

//--------------------------------------------------------------------------

exports.phoneLogin = catchAsync(async (req, res, next) => {
  const { phone, deviceId, fcmToken } = req.body;

  if (!phone) {
    return next(createError.validation("Please provide your phone number!"));
  }

  // Find the user by phone
  let user = await User.findOne({ phone });

  if (user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.login_time = helperFunction.unixTimestamp();
    user.deviceId = deviceId;
    user.fcmToken = fcmToken;
    await user.save({ validateBeforeSave: false });

    try {
      await helperFunction.sendSmsDigimiles(user.phone, otp);
    } catch (err) {
      return next(
        createError.internal("Failed to send OTP. Please try again.")
      );
    }

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully. Please verify your phone number.",
      data: user,
    });
    // }
  } else {
    // Create a new user and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    const newUser = await User.create({
      phone,
      name: "l",
      role: 2,
      otp,
      otpExpiry,
      verified: false,
      deviceId,
      fcmToken,
    });

    try {
      await helperFunction.sendSmsDigimiles(newUser.phone, otp);
    } catch (err) {
      return next(
        createError.internal("Failed to send OTP. Please try again.")
      );
    }

    return res.status(201).json({
      status: "success",
      message: "User created, OTP sent. Please verify your phone number.",
      data: newUser,
    });
  }
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(createError.validation("Please provide your phone number!"));
  }

  // Find the user by phone
  const user = await User.findOne({ phone });

  if (!user) {
    return next(createError.notFound("User not found with this phone number!"));
  }

  // Generate a new OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 15 * 60 * 1000;

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  try {
    // Send the OTP via SMS
    await helperFunction.sendSmsDigimiles(user.phone, otp);
  } catch (err) {
    return next(
      createError.internal("Failed to resend OTP. Please try again.")
    );
  }

  return res.status(200).json({
    status: "success",
    message: "OTP resent successfully. Please verify your phone number.",
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(createError.validation("Phone number and OTP are required."));
  }

  const user = await User.findOne({ phone, otp: otp });

  if (!user || user.otpExpiry < Date.now()) {
    return next(createError.validation("OTP is invalid or has expired."));
  }

  // Update the user as verified
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      verified: true,
      otp: undefined,
      otpExpiry: undefined,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // Send response
  helper.createClientSendToken(updatedUser, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      createError.unauthorized(
        "You are not logged in! Please log in to get access."
      )
    );
  }

  // 2) Verification token

  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        createError.unauthorized("Your token has expired! Please log in again.")
      );
    }
    return next(
      createError.unauthorized("Invalid token. Please log in again.")
    );
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      createError.unauthorized(
        "The user belonging to this token does no longer exist."
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      createError.unauthorized(
        "User recently changed password! Please log in again."
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.verifyOtpForForgot = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(createError.validation("Please provide phone and OTP."));
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return next(createError.notFound("User not found."));
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return next(createError.validation("Invalid or expired OTP."));
  }

  // Reset OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: "success",
    message: "OTP verified successfully.",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { phone, password, confirmPassword } = req.body;

  if (!phone || !password || !confirmPassword) {
    return next(createError.validation("Please provide all required fields."));
  }

  if (password !== confirmPassword) {
    return next(createError.validation("Passwords do not match."));
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return next(createError.notFound("User not found."));
  }

  user.password = password;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password reset successfully.",
  });
});

// Report User
exports.reportUser = catchAsync(async (req, res, next) => {
  const { reportedUserId, reportCategory, reportDescription } = req.body;
  const reporterId = req.user.id;

  // Validate required fields
  if (!reportedUserId || !reportCategory || !reportDescription) {
    const missingFields = [];
    if (!reportedUserId) missingFields.push("reportedUserId");
    if (!reportCategory) missingFields.push("reportCategory");
    if (!reportDescription) missingFields.push("reportDescription");

    return next(
      createError.validation(
        `Missing required fields: ${missingFields.join(", ")}`
      )
    );
  }

  // Check if user is trying to report themselves
  if (reporterId.toString() === reportedUserId.toString()) {
    return next(
      createError.validation("You cannot report yourself.")
    );
  }

  // Check if reported user exists
  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    return next(createError.notFound("Reported user not found."));
  }

  // Validate report category
  const validCategories = [
    "harassment",
    "spam",
    "inappropriate_content",
    "fake_profile",
    "scam",
    "other",
  ];
  if (!validCategories.includes(reportCategory)) {
    return next(
      createError.validation(
        `Invalid report category. Valid categories are: ${validCategories.join(", ")}`
      )
    );
  }

  // Create the report
  const report = await UserReport.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    reportCategory,
    reportDescription,
  });

  res.status(201).json({
    status: "success",
    message: "User reported successfully.",
    data: report,
  });
});
