const Flight = require('../models/Flight');

// @desc    Get all flights
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res, next) => {
  try {
    const { origin, destination, date } = req.query;

    let query = {};

    // Filter by origin
    if (origin) {
      query.origin = new RegExp(origin, 'i');
    }

    // Filter by destination
    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    // Filter by departure date
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const flights = await Flight.find(query).sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single flight
// @route   GET /api/flights/:id
// @access  Public
exports.getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new flight
// @route   POST /api/flights
// @access  Private/Admin
exports.createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create(req.body);

    res.status(201).json({
      success: true,
      data: flight
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update flight
// @route   PUT /api/flights/:id
// @access  Private/Admin
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
