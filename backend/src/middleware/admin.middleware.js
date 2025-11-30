function isAdmin(req, res, next) {
  // Assumes authenticateToken middleware runs before this
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    req.log.warn(
      { userId: req.user?.userId, role: req.user?.role },
      "Access denied: User is not an Admin."
    );
    return res
      .status(403)
      .json({ error: "Forbidden: Access is restricted to administrators." });
  }
}

module.exports = isAdmin;
