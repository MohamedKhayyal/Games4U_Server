const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utilts/catch.Async");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadSingle = (field) => (req, res, next) => {
  const handler = upload.single(field);
  handler(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

exports.uploadFields = (fields) => (req, res, next) => {
  const handler = upload.fields(fields);
  handler(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

exports.resize = catchAsync(async (req, res, next) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0))
    return next();

  const writeImage = async (buffer, folder, filename, width, height) => {
    const outputDir = path.join(process.cwd(), "uploads", folder);
    await fs.promises.mkdir(outputDir, { recursive: true });

    let image = sharp(buffer);
    if (width || height) image = image.resize(width, height);

    await image.jpeg({ quality: 90 }).toFile(
      path.join(outputDir, filename)
    );

    // ✅ PATH فقط
    return `/img/${folder}/${filename}`;
  };

  if (req.file) {
    const field = req.file.fieldname;
    let folder = "documents";
    let width = null;
    let height = null;

    if (field === "photo") {
      folder = "users";
      width = 500;
      height = 500;
    } else if (field === "image") {
      folder = "games";
      width = 800;
      height = 800;
    }

    const filename = `${field}-${Date.now()}.jpeg`;
    req.body[field] = await writeImage(
      req.file.buffer,
      folder,
      filename,
      width,
      height
    );
  }

  next();
});

