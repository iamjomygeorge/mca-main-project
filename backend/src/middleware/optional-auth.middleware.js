const jwt = require("jsonwebtoken");

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      req.log.warn(
        { err },
        "Optional auth: Invalid token received, proceeding anonymously."
      );
    } else {
      req.user = user;
    }
    next();
  });
}

module.exports = optionalAuthenticateToken;
