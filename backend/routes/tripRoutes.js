
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const requireAuth = require('../middleware/authMiddleware');

// NOTE: Auth is now enabled for trip operations
// Users must be logged in to create, view, and manage trips

// Trip CRUD
router.post('/', requireAuth, tripController.createTrip);
router.get('/', requireAuth, tripController.getMyTrips);
router.get('/:id', requireAuth, tripController.getTripDetails);
router.put('/:id', requireAuth, tripController.updateTrip);
router.delete('/:id', requireAuth, tripController.deleteTrip);

// Public Sharing
router.get('/share/:id', tripController.getPublicTrip);

// Stops
router.post('/:trip_id/stops', requireAuth, tripController.addStop);
router.put('/:trip_id/stops/:stop_id', requireAuth, tripController.updateStop);
router.delete('/:trip_id/stops/:stop_id', requireAuth, tripController.deleteStop);

// Activities
router.post('/:trip_id/activities', requireAuth, tripController.addActivity);
router.put('/:trip_id/activities/:activity_id', requireAuth, tripController.updateActivity);
router.delete('/:trip_id/activities/:activity_id', requireAuth, tripController.deleteActivity);

// Budget
router.get('/:id/budget', requireAuth, tripController.getTripBudget);

// Trip Sharing
router.patch('/:id/share', requireAuth, tripController.toggleTripSharing);

module.exports = router;
