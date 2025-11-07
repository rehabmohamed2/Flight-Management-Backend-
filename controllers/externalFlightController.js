const axios = require('axios');

// @desc    Search flights using SerpAPI (Google Flights)
// @route   GET /api/flights/search
// @access  Public
exports.searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, date, passengers, cabin, returnDate } = req.query;

    // Validate required parameters
    if (!origin || !destination || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide origin, destination, and date'
      });
    }

    // Build SerpAPI URL
    const serpApiUrl = 'https://serpapi.com/search.json';

    // Format codes: Keep Google entity IDs (/m/xxxxx) lowercase, uppercase airport codes
    const formatLocationCode = (code) => {
      return code.startsWith('/m/') ? code : code.toUpperCase();
    };

    const params = {
      engine: 'google_flights',
      api_key: process.env.SERPAPI_KEY,
      departure_id: formatLocationCode(origin),
      arrival_id: formatLocationCode(destination),
      outbound_date: date,
      currency: 'USD',
      hl: 'en'
    };

    // Add cabin class if provided
    if (cabin) {
      params.travel_class = cabin === 'Economy' ? '1' : cabin === 'Business' ? '2' : '3';
    }

    // Set trip type: one-way by default, round trip if return date provided
    if (returnDate) {
      params.type = '1'; // Round trip
      params.return_date = returnDate;
    } else {
      params.type = '2'; // One-way
    }

    // Call SerpAPI from backend (no CORS issues)
    const response = await axios.get(serpApiUrl, { params });

    // Return the data to frontend
    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error('SerpAPI Error:', err.response?.data || err.message);

    // Handle SerpAPI-specific errors
    if (err.response?.data?.error) {
      return res.status(400).json({
        success: false,
        message: err.response.data.error
      });
    }

    next(err);
  }
};
