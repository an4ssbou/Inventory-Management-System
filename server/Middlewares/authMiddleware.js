const jwt = require('jsonwebtoken');
const { secretKey } = require('../Configuration/jwtConfig');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Missing token!' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized: Invalid Token format' });
  }

  try {
    req.user = jwt.verify(token, secretKey);
    return next();
  } catch {
    return res.status(403).json({ message: 'Forbidden: Invalid Token' });
  }
};

module.exports = { authenticateToken };
