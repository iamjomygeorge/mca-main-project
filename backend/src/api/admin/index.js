const express = require("express");
const router = express.Router();

const authenticateToken = require("../../middleware/auth.middleware");
const isAdmin = require("../../middleware/admin.middleware");

const statsRoutes = require("./stats");
const usersRouter = require("./users");
const bookRoutes = require("./books");
const authorRoutes = require("./authors");
const securityRoutes = require("./security");
const messageRoutes = require("./messages");

router.use(authenticateToken, isAdmin);

router.use("/stats", statsRoutes);
router.use("/users", usersRouter);
router.use("/books", bookRoutes);
router.use("/authors", authorRoutes);
router.use("/messages", messageRoutes);
router.use("/", securityRoutes);

module.exports = router;
