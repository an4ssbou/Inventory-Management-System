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

const {reserveDemoRequest,serializeMutation}=require('../demo/middleware');
const demoOnly=(fn)=>(req,res,next)=>process.env.DEMO_MODE==='true'?fn(req,res,next):next();
router.post('/request', authenticateToken, demoOnly(serializeMutation), demoOnly(reserveDemoRequest), createRequest);
router.put('/request/:id', authenticateToken, isAdmin, demoOnly(serializeMutation), editRequest);
router.delete('/request/:id', authenticateToken, isAdmin, deleteRequest);
router.delete('/requests', authenticateToken, isAdmin, deleteAllRequests);
router.get('/requests', authenticateToken, getRequests);
router.get('/requests/:id', authenticateToken, getUserRequests);
router.get('/export-requests', authenticateToken, isAdmin, exportRequests);

module.exports = router;
