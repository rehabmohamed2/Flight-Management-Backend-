const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Please add a flight number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  origin: {
    type: String,
    required: [true, 'Please add origin city'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please add destination city'],
    trim: true
  },
  departureTime: {
    type: Date,
    required: [true, 'Please add a departure time'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Departure time must be in the future'
    }
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Please add an arrival time'],
    validate: {
      validator: function(v) {
        return v > this.departureTime;
      },
      message: 'Arrival time must be after departure time'
    }
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please add total seats'],
    min: 0
  },
  availableSeats: {
    type: Number,
    required: [true, 'Please add available seats'],
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Flight', flightSchema);
