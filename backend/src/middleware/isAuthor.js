function isAuthor(req, res, next) {
  // Assumes authenticateToken middleware runs before this
  if (req.user && req.user.role === 'AUTHOR') {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Access is restricted to authors." });
  }
}

module.exports = isAuthor;