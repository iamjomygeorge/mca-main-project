const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const bookRoutes = require("./books");
const adminRoutes = require("./admin");
const authorRoutes = require("./author");
const purchaseRoutes = require("./purchases");
const contactRoutes = require("./contact");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/admin", adminRoutes);
router.use("/author", authorRoutes);
router.use("/purchase", purchaseRoutes);
router.use("/contact", contactRoutes);

module.exports = router;