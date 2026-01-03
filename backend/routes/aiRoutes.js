const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Get activity suggestions for a city
router.post('/suggest', aiController.getSuggestions);

// Generate detailed trip plan
router.post('/trip-plan', aiController.generateTripPlan);

module.exports = router;
