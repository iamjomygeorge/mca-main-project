const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    req.log.warn("Unauthorized access attempt: No token provided.");
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.log.warn(
        { err },
        "Forbidden access attempt: Invalid or expired token."
      );
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid or expired token." });
    }

    if (user.scope === "2fa_login") {
      req.log.warn(
        { userId: user.userId },
        "Access denied: 2FA temp token attempted to access protected route."
      );
      return res.status(403).json({
        error: "Forbidden: Complete 2FA verification to access this resource.",
      });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
