const { asyncHandler } = require("../../utils/asyncHandler");
const { sendResponse, StatusCodes } = require("../../utils/response");
const { AppError } = require("../../utils/appError");
const service = require("../services/fileUpload.service");

// POST /upload/file
exports.uploadFiles = asyncHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new AppError("No files were uploaded", 400));
  }

  const baseUrl = process.env.CLOUDFRONT_URL || process.env.IMGURL || "";
  //   const uploadedBy = req.user._id;
  const docs = [];

  // Iterate over all fields handled by upload.middleware
  for (const field of Object.keys(req.files)) {
    const files = req.files[field];
    const keysFromBody = req.body[field];

    // Normalize keys to array to match files order
    const keys = Array.isArray(keysFromBody) ? keysFromBody : [keysFromBody];

    if (!keys || keys.length !== files.length) {
      return next(new AppError("Uploaded files mismatch", 400));
    }

    files.forEach((file, idx) => {
      const key = keys[idx];
      const [category] = (key || "").split("/");

      docs.push({
        fileName: key ? key.split("/").pop() : file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: key,
        fileUrl: baseUrl ? baseUrl + key : `/${key}`,
        category: category || "others",
        // uploadedBy,
      });
    });
  }

  const savedFiles = await service.createMany(docs);

  return sendResponse(res, {
    status: StatusCodes.CREATED,
    message: "File(s) uploaded successfully",
    data: savedFiles.length === 1 ? savedFiles[0] : savedFiles,
  });
});

// GET /upload/files
exports.getFiles = asyncHandler(async (req, res) => {
  const { category, uploadedBy, page = 1, limit = 10 } = req.query;
  const result = await service.getFiles({ category, uploadedBy, page, limit });

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Files fetched successfully",
    data: result,
  });
});

// GET /upload/file/:id
exports.getFileById = asyncHandler(async (req, res, next) => {
  const file = await service.getFileById(req.params.id);
  if (!file) {
    return next(new AppError("File not found", 404));
  }

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "File fetched successfully",
    data: file,
  });
});

// DELETE /upload/file/:id (soft delete)
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const deleted = await service.softDelete(req.params.id, req.user);
  if (!deleted) {
    return next(new AppError("File not found", 404));
  }

  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "File deleted successfully",
  });
});
