const jwt = require('jsonwebtoken');
const { secretKey } = require('../Configuration/jwtConfig');

const generateToken = (user) => {
  const payload = { id: user._id.toString() };
  return jwt.sign(payload, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN || '3h' });
};

module.exports = { generateToken };
