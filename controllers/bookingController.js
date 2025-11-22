const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phoneNumber')
      .populate('flightId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('flightId');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('flightId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    const isOwner = booking.userId && booking.userId._id && booking.userId._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const {
      flightId,
      flightDetails,
      seats,
      passengers,
      passengerDetails,
      contactDetails,
      seatAssignments,
      meals,
      baggage,
      pricing,
      paymentMethod
    } = req.body;

    // Validate that we have either flightId or flightDetails
    if (!flightId && !flightDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either flightId or flightDetails'
      });
    }

    // If using database flight (flightId), check availability
    let flight = null;
    if (flightId) {
      flight = await Flight.findById(flightId);

      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Flight not found'
        });
      }

      // Check if enough seats are available
      if (flight.availableSeats < seats) {
        return res.status(400).json({
          success: false,
          message: `Only ${flight.availableSeats} seats available`
        });
      }
    }

    // Create booking with all details
    const bookingData = {
      seats,
      status: 'confirmed'
    };

    // Add userId only if user is logged in
    if (req.user && req.user.id) {
      bookingData.userId = req.user.id;
    }

    // Add flightId or flightDetails
    if (flightId) {
      bookingData.flightId = flightId;
    }
    if (flightDetails) {
      bookingData.flightDetails = flightDetails;
    }

    // Add optional fields if provided
    if (passengers) bookingData.passengers = passengers;
    if (passengerDetails) bookingData.passengerDetails = passengerDetails;
    if (contactDetails) bookingData.contactDetails = contactDetails;
    if (seatAssignments) bookingData.seatAssignments = seatAssignments;
    if (meals) bookingData.meals = meals;
    if (baggage) bookingData.baggage = baggage;
    if (pricing) bookingData.pricing = pricing;
    if (paymentMethod) bookingData.paymentMethod = paymentMethod;

    // Create the booking
    const booking = await Booking.create(bookingData);

    // Update available seats only for database flights
    if (flight) {
      flight.availableSeats -= seats;
      await flight.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phoneNumber')
      .populate('flightId');

    res.status(201).json({
      success: true,
      data: populatedBooking,
      bookingReference: populatedBooking.bookingReference
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    const isOwner = booking.userId && booking.userId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email').populate('flightId');

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    const isOwner = booking.userId && booking.userId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Return seats to flight
    const flight = await Flight.findById(booking.flightId);
    if (flight) {
      flight.availableSeats += booking.seats;
      await flight.save();
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking permanently (Admin only)
// @route   DELETE /api/bookings/:id/admin
// @access  Private/Admin
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Return seats to flight if booking was not cancelled
    if (booking.status !== 'cancelled') {
      const flight = await Flight.findById(booking.flightId);
      if (flight) {
        flight.availableSeats += booking.seats;
        await flight.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (Admin only)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If changing to cancelled, return seats
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const flight = await Flight.findById(booking.flightId);
      if (flight) {
        flight.availableSeats += booking.seats;
        await flight.save();
      }
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
