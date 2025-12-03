const Flight = require('../models/Flight');

exports.getFlights = async (req, res, next) => {
  try {
    const { origin, destination, date } = req.query;

    let query = {};

    if (origin) {
      query.origin = new RegExp(origin, 'i');
    }

    // Filter by destination
    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

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
