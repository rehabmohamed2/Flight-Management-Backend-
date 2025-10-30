const Flight = require('../models/Flight');
const axios = require('axios');

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

// @desc    Search flights using Google Flights (SerpAPI)
// @route   GET /api/flights/search/external
// @access  Public
exports.searchFlights = async (req, res, next) => {
  try {
    // Check if API key is configured
    if (!process.env.SERPAPI_KEY) {
      return res.status(500).json({
        success: false,
        message: 'SerpAPI key is not configured'
      });
    }

    // Build params for SerpAPI
    const params = {
      engine: 'google_flights',
      api_key: process.env.SERPAPI_KEY,
      ...req.query
    };

    console.log('Searching flights with SerpAPI:', { ...params, api_key: '***' });

    // Make request to SerpAPI
    const response = await axios.get('https://serpapi.com/search', { params });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (err) {
    console.error('SerpAPI Error:', err.response?.data || err.message);

    // Handle SerpAPI specific errors
    if (err.response?.data?.error) {
      return res.status(err.response.status || 500).json({
        success: false,
        message: err.response.data.error
      });
    }

    next(err);
  }
};
