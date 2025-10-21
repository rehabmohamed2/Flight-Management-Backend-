// In: routes/flightRoutes.js

const express = require('express');
const router = express.Router();

// 1. Import your new controller function
const { getAllFlights } = require('../controllers/flightController');

// 2. Create the route
// When a GET request comes to '/', use the 'getAllFlights' function
router.get('/', getAllFlights);

// You might also see it written as:
// router.route('/').get(getAllFlights);

// ...other routes for flights will go here (like POST, GET /:id, etc.)

module.exports = router;