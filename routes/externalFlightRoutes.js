const express = require('express');
const router = express.Router();
const { searchFlights } = require('../controllers/externalFlightController');

// Search flights using SerpAPI
router.get('/search', searchFlights);

module.exports = router;
