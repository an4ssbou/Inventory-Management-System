const express = require('express');
const router = express.Router();
const { CreateMaterial, DeleteMaterial, EditMaterial, GetMaterials } = require('../Controllers/MaterialControllers');
const { isAdmin } = require('../Middlewares/isAdmin');
const { authenticateToken } = require('../Middlewares/authMiddleware');
const upload = require('../Middlewares/upload');

router.post('/material', authenticateToken, isAdmin, upload.single('image'), CreateMaterial);
router.put('/material/:id', authenticateToken, isAdmin, upload.single('image'), EditMaterial);
router.delete('/material/:id', authenticateToken, isAdmin, DeleteMaterial);
router.get('/material', authenticateToken, GetMaterials);

module.exports = router;
