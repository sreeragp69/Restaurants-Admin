const express = require("express");
const authController = require("../controller/auth.controller");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// User Registration
router.post("/signup", upload.single("image"), authController.userRegistration);
// User Login
router.post("/login", authController.login);
// User Profile
router.get("/profile", authController.protect, authController.getUserProfile);
// Update User Profile
router.post(
  "/updateUserProfile",
  authController.protect,
  upload.single("image"),
  authController.updateUserProfile
);
// Update Password
router.post(
  "/updateUserPassword",
  authController.protect,
  authController.updateUserPassword
);

// Social Login - Google
router.post("/socialLoginGoogle", authController.socialLoginGoogle);

//-----------------------------------------

router.post("/phoneLogin", authController.phoneLogin);

router.post("/resend_otp", authController.resendOtp);

router.post("/otp_verification", authController.verifyOtp);

// Forgot Password
router.post("/forgotPassword", authController.forgotPassword);

router.post(
  "/otp_verify_for_forgotPassword",
  authController.verifyOtpForForgot
);

router.post("/reset_password", authController.resetPassword);

// Report User
router.post("/reportUser", authController.protect, authController.reportUser);

module.exports = router;
