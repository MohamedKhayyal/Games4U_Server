const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utilts/catch.Async");

const IMAGE_CONFIG = {
  photo: { folder: "users", width: 500, height: 500 },
  image: { folder: "courses", width: 800, height: 800 },
  default: { folder: "documents", width: 1000, height: null },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

exports.uploadSingle = (field) => (req, res, next) =>
  upload.single(field)(req, res, next);

exports.uploadFields = (fields) => (req, res, next) =>
  upload.fields(fields)(req, res, next);

// ✅ FIX: write images to root/uploads
const writeImage = async (buffer, folder, filename, width, height) => {
  const outputDir = path.join(process.cwd(), "uploads", folder);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const outPath = path.join(outputDir, filename);

  let pipeline = sharp(buffer);
  if (width || height) {
    pipeline = pipeline.resize(width, height);
  }

  await pipeline.jpeg({ quality: 90 }).toFile(outPath);

  // نخزن path اللي Express يفهمه
  return `/img/${folder}/${filename}`;
};

exports.resize = catchAsync(async (req, res, next) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  const processFile = async (file, key) => {
    const config = IMAGE_CONFIG[key] || IMAGE_CONFIG.default;
    const filename = `${key}-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}.jpeg`;

    return writeImage(
      file.buffer,
      config.folder,
      filename,
      config.width,
      config.height,
    );
  };

  if (req.file) {
    req.body[req.file.fieldname] = await processFile(
      req.file,
      req.file.fieldname,
    );
  }

  if (req.files) {
    for (const key of Object.keys(req.files)) {
      const files = req.files[key];
      if (!files || files.length === 0) continue;

      const paths = [];
      for (const file of files) {
        paths.push(await processFile(file, key));
      }

      req.body[key] = paths.length === 1 ? paths[0] : paths;
    }
  }

  next();
});
