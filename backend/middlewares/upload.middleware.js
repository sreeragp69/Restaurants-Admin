const multer = require("multer");
const { AppError } = require("../utils/appError");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
});

/* Auto-folder based on MIME */
const resolveFolder = (mime) => {
  if (mime.startsWith("image")) return "images";

  if (mime.startsWith("video")) return "videos";

  if (
    mime.includes("pdf") ||
    mime.includes("word") ||
    mime.includes("msword") ||
    mime.includes("presentation") ||
    mime.includes("spreadsheet")
  )
    return "docs";

  if (
    mime.includes("model") ||
    mime.includes("obj") ||
    mime.includes("stl") ||
    mime.includes("gltf") ||
    mime.includes("fbx") ||
    mime.includes("glb")
  )
    return "3dmodels";

  return "others";
};

/* ==================================================
   Universal Upload Handler (single/multiple/fields)
   ================================================== */

const handleUploads = (fields, model) => {
  const multerFieldUpload = upload.fields(fields);

  return async (req, res, next) => {
    try {
      // Run Multer
      await new Promise((resolve, reject) => {
        multerFieldUpload(req, res, (err) => (err ? reject(err) : resolve()));
      });

      if (!req.files || Object.keys(req.files).length === 0) {
        return next();
      }

      const userId = req.user?.id || "public";
      // const doc = await model.findById(req.user._id).lean();
      const doc = req.user?._id
        ? await model.findById(req.user._id).lean()
        : null;

      req.body.uploads = {}; // store processed file paths here

      // Loop fields
      for (const field of Object.keys(req.files)) {
        const fileArray = req.files[field];

        // DELETE old file(s) if exist
        if (doc && doc[field]) {
          if (Array.isArray(doc[field])) {
            for (const oldPath of doc[field]) {
              try {
                const fullPath = path.join(__dirname, "..", oldPath);
                if (fs.existsSync(fullPath)) {
                  fs.unlinkSync(fullPath);
                }
              } catch (e) {
                console.log("Not fatal: delete fail", e);
              }
            }
          } else {
            try {
              const fullPath = path.join(__dirname, "..", doc[field]);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            } catch (e) {
              console.log("Not fatal: delete fail", e);
            }
          }
        }

        const uploadedPaths = [];

        // Upload each file to local storage
        for (const file of fileArray) {
          const folder = resolveFolder(file.mimetype);
          const extension = file.originalname.split(".").pop();
          const fileName = `${field}-${userId}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;

          const folderPath = path.join(__dirname, "..", folder);
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
          }

          const filePath = path.join(folderPath, fileName);
          fs.writeFileSync(filePath, file.buffer);

          // Store relative path (e.g., "images/filename.jpg")
          const relativePath = `${folder}/${fileName}`;
          uploadedPaths.push(relativePath);
        }

        // Store into req.body so controller can update DB
        req.body[field] =
          uploadedPaths.length === 1 ? uploadedPaths[0] : uploadedPaths;
      }

      next();
    } catch (err) {
      // Log the error properly
      logger.error("File upload error", {
        error: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack,
      });

      // Handle Multer errors specifically
      if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError(
              `File too large for field '${err.field}'. Maximum size is 100MB.`,
              400
            )
          );
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }

      next(new AppError("File upload failed", 500));
    }
  };
};

module.exports = { handleUploads };
