const express = require('express');
const router = express.Router();
const {
  createRequest,
  editRequest,
  deleteAllRequests,
  deleteRequest,
  getRequests,
  getUserRequests,
  exportRequests,
} = require('../Controllers/RequestControllers');
const { isAdmin } = require('../Middlewares/isAdmin');
const { authenticateToken } = require('../Middlewares/authMiddleware');

router.post('/request', authenticateToken, createRequest);
router.put('/request/:id', authenticateToken, isAdmin, editRequest);
router.delete('/request/:id', authenticateToken, isAdmin, deleteRequest);
router.delete('/requests', authenticateToken, isAdmin, deleteAllRequests);
router.get('/requests', authenticateToken, getRequests);
router.get('/requests/:id', authenticateToken, getUserRequests);
router.get('/export-requests', authenticateToken, isAdmin, exportRequests);

module.exports = router;
