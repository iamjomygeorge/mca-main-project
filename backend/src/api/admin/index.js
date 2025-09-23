const express = require("express");
const router = express.Router();

const statsRoutes = require("./overview-stats");

router.use("/stats", statsRoutes);

module.exports = router;