const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  getContractExpiryByCollege
} = require('../controllers/contractController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// New route for contract expiry by college
router.get('/expiry', verifyToken, adminMiddleware, getContractExpiryByCollege);
// Admin Routes for Contracts
router.post('/', verifyToken, adminMiddleware, createContract);
router.get('/', verifyToken, adminMiddleware, getAllContracts);
router.get('/:id', verifyToken, adminMiddleware, getContractById);
router.put('/:id', verifyToken, adminMiddleware, updateContract);
router.delete('/:id', verifyToken, adminMiddleware, deleteContract);

module.exports = router;
