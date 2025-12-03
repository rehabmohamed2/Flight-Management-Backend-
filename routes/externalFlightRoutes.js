const express = require('express');
const router = express.Router();
const { searchFlights } = require('../controllers/externalFlightController');

router.get('/search', searchFlights);

module.exports = router;
