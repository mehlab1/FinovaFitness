import express from 'express';
import facilityController from '../controllers/facilityController.js';
import bookingController from '../controllers/bookingController.js';
import { verifyToken, verifyAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (require admin authentication)
router.get('/admin/facilities', verifyToken, verifyAdmin, facilityController.getAllFacilities);
router.get('/admin/facilities/:id', verifyToken, verifyAdmin, facilityController.getFacilityById);
router.post('/admin/facilities', verifyToken, verifyAdmin, facilityController.createFacility);
router.put('/admin/facilities/:id', verifyToken, verifyAdmin, facilityController.updateFacility);
router.delete('/admin/facilities/:id', verifyToken, verifyAdmin, facilityController.deleteFacility);

// Facility schedules
router.get('/admin/facilities/:facilityId/schedules', verifyToken, verifyAdmin, facilityController.getFacilitySchedules);
router.put('/admin/facilities/:facilityId/schedules', verifyToken, verifyAdmin, facilityController.updateFacilitySchedules);

// Slot management
router.post('/admin/facilities/:facilityId/slots', verifyToken, verifyAdmin, facilityController.generateSlots);
router.get('/admin/facilities/:facilityId/slots', verifyToken, verifyAdmin, facilityController.getFacilitySlots);
router.put('/admin/slots/status', verifyToken, verifyAdmin, facilityController.updateSlotStatus);

// Analytics
router.get('/admin/facilities/:facilityId/analytics', verifyToken, verifyAdmin, facilityController.getFacilityAnalytics);

// Test endpoints
router.get('/admin/test-database', verifyToken, verifyAdmin, facilityController.testDatabase);
router.get('/admin/test-method-binding', verifyToken, verifyAdmin, facilityController.testMethodBinding);

// Clear facility slots
router.delete('/admin/facilities/:facilityId/slots', verifyToken, verifyAdmin, facilityController.clearFacilitySlots);

// Bookings overview (admin)
router.get('/admin/bookings', verifyToken, verifyAdmin, facilityController.getAllBookings);

// Waitlist management (admin)
router.get('/admin/facilities/:facilityId/waitlist', verifyToken, verifyAdmin, bookingController.getFacilityWaitlist);

// Public routes (no authentication required)
router.get('/', bookingController.getAvailableFacilities);
router.get('/facilities', bookingController.getAvailableFacilities);
router.get('/facilities/:facilityId/slots', bookingController.getAvailableSlots);

// User routes (require user authentication)
router.post('/bookings', requireAuth, bookingController.bookSlot);
router.get('/bookings/user', requireAuth, bookingController.getUserBookings);
router.put('/bookings/:bookingId/cancel', requireAuth, bookingController.cancelBooking);

// Waitlist routes (require user authentication)
router.post('/waitlist', requireAuth, bookingController.joinWaitlist);
router.get('/waitlist/user', requireAuth, bookingController.getUserWaitlist);
router.delete('/waitlist/:waitlistId', requireAuth, bookingController.removeFromWaitlist);

export default router;
