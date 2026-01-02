const {asyncHandler} = require("../../utils/asyncHandler");
const service = require("../services/heroBanner.service");
const { sendResponse, StatusCodes } = require("../../utils/response");

exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await service.createBanner(req.body);

  return sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "Hero banner created successfully",
    data: banner,
  });
});

exports.getAllBanners = asyncHandler(async (req, res) => {
  const banners = await service.getAllBanners();

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Hero banners retrieved successfully",
    data: banners,
  });
});

exports.getSingleBanner = asyncHandler(async (req, res) => {
  const banner = await service.getSingleBanner(req.params.id);

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Hero banner retrieved successfully",
    data: banner,
  });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await service.updateBanner(req.params.id, req.body);

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Hero banner updated successfully",
    data: banner,
  });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await service.deleteBanner(req.params.id);

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Hero banner deleted successfully",
  });
});

exports.saveBanner = asyncHandler(async (req, res) => {
  const data = req.body;

  // if image/video uploaded
  if (req.body.bannerImage) {
    data.bannerImage = req.body.bannerImage;
  }

  if (req.body.loopingVideo) {
    data.loopingVideo = req.body.loopingVideo;
  }

  const banner = await service.saveBanner(data);

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Hero banner saved successfully",
    data: banner,
  });
});


