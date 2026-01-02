const HeroBanner = require("../models/heroBanner.model");
const createError = require("../../utils/appError");

exports.createBanner = async (data) => {
  const banner = await HeroBanner.create(data);
  return banner;
};

exports.getAllBanners = async () => {
  return await HeroBanner.find().sort({ createdAt: -1 });
};

exports.getSingleBanner = async (id) => {
  const banner = await HeroBanner.findById(id);
  if (!banner) throw createError.notFound("Hero banner not found");
  return banner;
};

exports.updateBanner = async (id, data) => {
  const banner = await HeroBanner.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!banner) throw createError.notFound("Hero banner not found");

  return banner;
};

exports.deleteBanner = async (id) => {
  const banner = await HeroBanner.findByIdAndDelete(id);
  if (!banner) throw createError.notFound("Hero banner not found");
  return true;
};


exports.saveBanner = async (data) => {
  let banner = await HeroBanner.findOne();

  if (!banner) {
    return await HeroBanner.create(data);
  }

  banner.set(data);        
  await banner.save();

  return banner;
};


