
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.get('/stats', requireAuth, userController.getUserStats);

module.exports = router;
