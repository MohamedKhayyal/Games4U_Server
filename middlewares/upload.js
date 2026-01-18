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

    const outPath = path.join(outputDir, filename);

    let pipeline = sharp(buffer);
    if (width || height) {
      pipeline = pipeline.resize(width || null, height || null);
    }

    await pipeline.jpeg({ quality: 90 }).toFile(outPath);

    return `http://localhost:5000/img/${folder}/${filename}`;
  };

  if (req.file) {
    const field = req.file.fieldname || "file";
    let folder = "uploads";
    let width = null;
    let height = null;

    if (field === "photo") {
      folder = "users";
      width = 500;
      height = 500;
    } else if (field === "image") {
      folder = "courses";
      width = 800;
      height = 800;
    } else {
      folder = "documents";
      width = 1000;
      height = null;
    }

    const filename = `${field}-${Date.now()}.jpeg`;
    req.body[field] = await writeImage(
      req.file.buffer,
      folder,
      filename,
      width,
      height,
    );
  }

  if (req.files && Object.keys(req.files).length > 0) {
    for (const key of Object.keys(req.files)) {
      const fileArr = req.files[key];
      if (!fileArr || fileArr.length === 0) continue;

      const file = fileArr[0];

      let folder = "documents";
      let width = 1000;
      let height = null;

      if (key === "photo") {
        folder = "users";
        width = 500;
        height = 500;
      } else if (key === "image") {
        folder = "courses";
        width = 800;
        height = 800;
      }

      const filename = `${key}-${Date.now()}.jpeg`;
      req.body[key] = await writeImage(
        file.buffer,
        folder,
        filename,
        width,
        height,
      );
    }
  }

  next();
});
