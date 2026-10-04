const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('STORE_OWNER'));
router.get('/dashboard', storeOwnerController.getStoreOwnerDashboard);

module.exports = router;
