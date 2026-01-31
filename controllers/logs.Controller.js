const fs = require("fs");
const path = require("path");
const AppError = require("../utilts/app.Error");

exports.getLogs = async (req, res, next) => {
    const { type = "error", limit = 100 } = req.query;

    const allowed = ["error", "warn", "info", "debug"];
    if (!allowed.includes(type)) {
        return next(new AppError("Invalid log type", 400));
    }

    const logPath = path.join(__dirname, `../logs/${type}.log`);

    if (!fs.existsSync(logPath)) {
        return res.status(200).json({
            status: "success",
            data: { logs: [] },
        });
    }

    const file = fs.readFileSync(logPath, "utf-8");

    const lines = file
        .split("\n")
        .filter(Boolean)
        .slice(-Number(limit));

    res.status(200).json({
        status: "success",
        results: lines.length,
        data: {
            logs: lines.reverse(),
        },
    });
};

exports.downloadLog = async (req, res, next) => {
    const { type = "error" } = req.query;

    const allowed = ["error", "warn", "info", "debug"];
    if (!allowed.includes(type)) {
        return next(new AppError("Invalid log type", 400));
    }

    const logPath = path.join(__dirname, `../logs/${type}.log`);

    if (!fs.existsSync(logPath)) {
        return next(new AppError("Log file not found", 404));
    }

    res.download(logPath, `${type}.log`);
};