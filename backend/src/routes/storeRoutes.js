const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateRatingSubmit } = require('../middleware/validator');

// Optional auth for store listings to identify user's submitted rating
router.get('/', verifyToken, storeController.getStoresForUser);

// Rating submission/modification for Normal Users
router.post('/:id/rating', verifyToken, requireRole('USER'), validateRatingSubmit, storeController.submitOrUpdateRating);
router.put('/:id/rating', verifyToken, requireRole('USER'), validateRatingSubmit, storeController.submitOrUpdateRating);

module.exports = router;
