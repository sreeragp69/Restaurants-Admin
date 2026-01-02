const router = require("express").Router();
const controller = require("../controllers/heroBanner.controller");
const HeroBanner = require("../models/heroBanner.model");
const { handleUploads } = require("../../middlewares/upload.middleware");
const authController = require("../controllers/auth.controller");

// router.post("/createBanner", handleUploads([{ name: "bannerImage", maxCount: 1 }], HeroBanner), controller.createBanner);
router.get("/getAllBanners", controller.getAllBanners);
router.get("/getSingleBanner/:id", controller.getSingleBanner);
// router.put(
//   "/updateBanner/:id",
//   handleUploads([{ name: "bannerImage", maxCount: 1 }, ], HeroBanner),
//   controller.updateBanner
// );
router.delete("/deleteBanner/:id", authController.protect, controller.deleteBanner);

router.post(
  "/saveBanner",
  handleUploads(
    [
      { name: "bannerImage", maxCount: 1 },
      { name: "loopingVideo", maxCount: 1 },
    ],
    HeroBanner
  ),
  authController.protect,
  controller.saveBanner
);

module.exports = router;
