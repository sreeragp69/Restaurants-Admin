const Admin = require("../models/admin.model");
const Role = require("../models/role.model");
const catchAsync = require("../../utils/catchAsync");
const { AppError } = require("../../utils/appError");
const helper = require("../../helper");
const {
  sendCreated,
  sendUpdated,
  sendData,
  sendResponse,
} = require("../../utils/response");

exports.userRegistration = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm, phone } = req.body;

  const profile_image = req.body.profile_image
    ?  req.body.profile_image
    : "";

  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    return next(new AppError("Email already exists!", 409));
  }

  const newAdmin = await Admin.create({
    name,
    email,
    role,
    password,
    passwordConfirm,
    phone,
    profile_image, 
    verified: true,
  });

  sendCreated(res, newAdmin, "Admin registered successfully.");
});



exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Check if user exists && password is correct
  const admin = await Admin.findOne({ email })
    .select("+password")
    .populate("role");

  if (!admin) {
    return next(new AppError("User not found, please contact to admin", 400));
  }

  if (!admin.role) {
    return next(
      new AppError(
        "You haven't been assigned any role, please contact to admin",
        400
      )
    );
  }

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if the user is active
  if (admin.active === false) {
    return next(
      new AppError(
        "Your account is inactive, please contact the administrator.",
        403
      )
    );
  }

  helper.createSendToken(admin, 200, req, res);
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You are not allowed to update password from here.",
        400
      )
    );
  }

  // Allow only safe fields
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "phone",
    "profile_image"
  );

  // profile_image already contains S3 key
  if (filteredBody.profile_image) {
    filteredBody.profile_image = filteredBody.profile_image;
  }

  const updatedUser = await Admin.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  sendUpdated(res, updatedUser, "Profile updated successfully.");
});



exports.uploadProfilePic = catchAsync(async (req, res, next) => {
  const profile_image = req.body.profile_image; // already the correct S3 URL

  const admin = await Admin.findByIdAndUpdate(
    req.user._id,
    { profile_image },
    { new: true }
  );

  if (!admin) {
    return next(new AppError("No document found with that ID", 404));
  }

  sendUpdated(
    res,
    { profile_image: admin.profile_image },
    "Profile uploaded successfully."
  );
});

exports.getPermissions = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await Admin.findById(userId).populate("role");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendResponse(res, {
    message: "Permissions fetched successfully.",
    data: { permissions: user.role.rolePermissions },
  });
});

exports.getPhysicians = catchAsync(async (req, res, next) => {
  const physicianRole = await Role.findOne({ roleName: "Physician" });

  if (!physicianRole) {
    return next(new AppError("Physician role not found", 404));
  }

  const physicians = await Admin.find({ role: physicianRole._id }).populate(
    "role"
  );

  if (!physicians || physicians.length === 0) {
    return next(new AppError("No users found with the Physician role", 404));
  }

  sendData(res, physicians, "Physicians fetched successfully.");
});

exports.getPersonas = catchAsync(async (req, res, next) => {
  const data = await Admin.find({ roleName: req.params.name }).populate("role");

  if (!data || data.length === 0) {
    return next(new AppError("No users found with the role", 404));
  }

  sendData(res, data, "Personas fetched successfully.");
});

exports.getAllPersona = catchAsync(async (req, res, next) => {
  const { active } = req.query;
  let query = {};

  if (active === "true") {
    query.active = true;
  } else if (active === "false") {
    query.active = false;
  }

  const features = Admin.find(query).populate("role");
  const data = await features;

  if (!data) {
    return next(new AppError("No document found", 404));
  }

  sendResponse(res, {
    message: "Personas retrieved successfully.",
    data,
    meta: { total: data.length },
  });
});

exports.protect = helper.protect(Admin);
exports.authenticate = helper.authenticate(Admin);
exports.getDataById = helper.getOne(Admin, "role");
exports.update = helper.updateOne(Admin);
exports.delete = helper.deleteOne(Admin);
exports.forgotPassword = helper.forgotPassword(Admin, "URL");
exports.resetPassword = helper.resetPassword(Admin);
exports.updatePassword = helper.updatePassword(Admin);
