const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateSignup, validateStoreCreate } = require('../middleware/validator');

// All admin routes require ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users', validateSignup, adminController.addUser);
router.get('/stores', adminController.getStores);
router.post('/stores', validateStoreCreate, adminController.addStore);

module.exports = router;
