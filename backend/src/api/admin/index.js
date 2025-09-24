const express = require("express");
const router = express.Router();

const statsRoutes = require("./overview-stats");
const bookRoutes = require("./books");

router.use("/stats", statsRoutes);
router.use("/books", bookRoutes);

module.exports = router;