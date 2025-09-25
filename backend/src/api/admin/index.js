const express = require("express");
const router = express.Router();

const statsRoutes = require("./overview-stats");
const bookRoutes = require("./books");
const authorRoutes = require("./authors");

router.use("/stats", statsRoutes);
router.use("/books", bookRoutes);
router.use("/authors", authorRoutes);

module.exports = router;