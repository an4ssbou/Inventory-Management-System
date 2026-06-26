const User = require('../Models/User')

const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id)
  if (user && user.Role === "Admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Only admins are allowed to access this page" });
  }
};

module.exports = { isAdmin };