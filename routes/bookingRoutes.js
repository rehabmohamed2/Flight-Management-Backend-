const express = require('express');
const {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(authorize('admin'), getBookings)
  .post(createBooking);

router.get('/my-bookings', getMyBookings);

router
  .route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(cancelBooking);

module.exports = router;
