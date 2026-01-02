const adminRouter = require("./admin.router");
const roleRouter = require("./role.router");
const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const heroBannerRouter = require("./heroBanner.routes");

router.use("/admin", adminRouter, roleRouter, userRouter);
router.use("/admin", heroBannerRouter);
module.exports = router;
