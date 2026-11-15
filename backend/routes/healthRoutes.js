const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SpotFixAI API is healthy",
    service: "SpotFixAI",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Health routes working",
  });
});

module.exports = router;