const express = require('express');
const router = express.Router();
const {CreateUser,DeleteUser,EditUser,GetUsers,GetUser} = require("../Controllers/UserControllers")
const {isAdmin} = require("../Middlewares/isAdmin")
const { authenticateToken } = require("../Middlewares/authMiddleware")



router.post('/user',authenticateToken,isAdmin,CreateUser)
router.delete('/user/:id',authenticateToken,isAdmin,DeleteUser)
router.put('/user/:id',authenticateToken,isAdmin,EditUser)
router.get('/users',authenticateToken,isAdmin,GetUsers)
router.get("/user/:id",authenticateToken,GetUser)

module.exports = router