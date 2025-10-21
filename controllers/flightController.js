
const Flight = require('../models/Flight');

// 2. Create the function that gets all flights
// We name it 'getAllFlights' or something similar
const getAllFlights = async (req, res) => {
  try {
    // 3. Create an empty filter object
    const filter = {};

    // 4. Check for optional query parameters (req.query)
    if (req.query.origin) {
      filter.origin = req.query.origin;
    }

    if (req.query.destination) {
      filter.destination = req.query.destination;
    }

    if (req.query.date) {
      const startDate = new Date(req.query.date);
      // Set to the beginning of the day (in UTC)
      startDate.setUTCHours(0, 0, 0, 0); 

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Find flights where departureTime is on that day
      filter.departureTime = {
        $gte: startDate, // Greater than or equal to the start of the day
        $lt: endDate    // Less than the start of the *next* day
      };
    }

    // 5. Find flights in MongoDB using the filter
    // If 'filter' is empty, it finds all flights
    const flights = await Flight.find(filter);

    // 6. Send the JSON response
    res.status(200).json(flights);

  } catch (error) {
    // 7. Send an error if anything went wrong
    // Your 'errorHandler.js' middleware might handle this automatically,
    // but it's good practice to send a status.
    res.status(500).json({ message: 'Error fetching flights', error: error.message });
  }
};

// 8. Export your new function so the router can use it
module.exports = {
  getAllFlights,
  // ...other functions for this controller will be added here
  // (like getFlightById, createFlight, etc.)
};