const express = require("express");
const router = express.Router();

const statsRoutes = require("./overview-stats");
const bookRoutes = require("./books");
const authorRoutes = require("./authors");
const securityRoutes = require("./adminSecurity");
const messageRoutes = require("./messages");

router.use("/stats", statsRoutes);
router.use("/books", bookRoutes);
router.use("/authors", authorRoutes);
router.use("/messages", messageRoutes);
router.use("/", securityRoutes);

module.exports = router;