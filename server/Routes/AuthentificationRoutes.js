const express = require('express');
const router = express.Router();
const { SignUp, LogIn, BootstrapAdmin } = require('../Controllers/AuthentificationControllers');
const { authenticateToken } = require('../Middlewares/authMiddleware');
const { isAdmin } = require('../Middlewares/isAdmin');

router.post('/bootstrap-admin', BootstrapAdmin);
router.post('/signup', authenticateToken, isAdmin, SignUp);
router.post('/login', LogIn);

module.exports = router;
