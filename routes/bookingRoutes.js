const express = require('express');
const {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Note: Some routes require authentication, others don't

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       403:
 *         description: Admin access required
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Not enough seats available
 */
router
  .route('/')
  .get(protect, authorize('admin'), getBookings)
  .post(optionalAuth, createBooking);  // Optional auth - captures user if logged in

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's bookings retrieved
 */
router.get('/my-bookings', protect, getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get single booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Not authorized to view this booking
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seats:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking updated
 *   delete:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, cancelBooking);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, pending]
 *     responses:
 *       200:
 *         description: Booking status updated
 *       403:
 *         description: Admin access required
 */
router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

/**
 * @swagger
 * /bookings/{id}/admin:
 *   delete:
 *     summary: Delete booking permanently (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete('/:id/admin', protect, authorize('admin'), deleteBooking);

module.exports = router;
