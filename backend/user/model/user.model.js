const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    email: {
      type: String,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    country: {
      type: String,
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    deviceId: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    xp: {
      type: Number,
      default: 0,
    },
    goldCoin: {
      type: Number,
      default: 0,
    },
    germsCoin: {
      type: Number,
      default: 0,
    },
    transmogCoin: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const saltRounds = 10; // Define salt rounds for bcrypt hashing

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(saltRounds);
  this.password = bcrypt.hashSync(this.password, salt).replace("$2b$", "$2y$");
  next();
});

// Pre-save hook to update the passwordChangedAt field
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to compare a given password with the stored password hash
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  userPassword = userPassword.replace("$2y$", "$2b$");
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if the password was changed after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
