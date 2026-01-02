const mongoose = require("mongoose");

const heroBannerSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      default: "",
    },
    ctaButtons: {
      playNow: {
        text: { type: String, default: "Play Now" },
        link: { type: String, default: "" },
      },
      watchTrailer: {
        text: { type: String, default: "Watch Trailer" },
        link: { type: String, default: "" },
      },
    },
    loopingVideo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroBanner", heroBannerSchema);
