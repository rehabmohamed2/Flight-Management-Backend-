const mongoose = require('mongoose');

// Sub-schema for passenger details
const passengerSchema = new mongoose.Schema({
  title: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  nationality: { type: String },
  passportNumber: { type: String },
  type: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' }
}, { _id: false });

// Sub-schema for contact details
const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Allow 9-15 digits to support international numbers
        return /^\d{9,15}$/.test(v);
      },
      message: 'Phone number must be between 9 and 15 digits'
    }
  },
  country: { type: String }
}, { _id: false });

// Sub-schema for flight details (for external flights from SerpAPI)
const flightDetailsSchema = new mongoose.Schema({
  airline: { type: String },
  airlineLogo: { type: String },
  flightNumber: { type: String },
  from: { type: String },
  to: { type: String },
  fromCode: { type: String },
  toCode: { type: String },
  departTime: { type: String },
  arriveTime: { type: String },
  departDate: { type: String },
  duration: { type: String },
  stops: { type: Number, default: 0 },
  cabinClass: { type: String },
  price: { type: Number },
  currency: { type: String, default: 'USD' }
}, { _id: false });

// Sub-schema for pricing breakdown
const pricingSchema = new mongoose.Schema({
  flightCost: { type: Number, default: 0 },
  mealsCost: { type: Number, default: 0 },
  baggageCost: { type: Number, default: 0 },
  taxesAndFees: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Not required - allows guest bookings
  },
  // For database flights (optional - can use flightDetails instead)
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  },
  // For external flights from SerpAPI
  flightDetails: flightDetailsSchema,
  bookingReference: {
    type: String,
    unique: true
  },
  // Number of seats booked
  seats: {
    type: Number,
    required: [true, 'Please add number of seats'],
    min: 1
  },
  // Passenger breakdown
  passengers: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 }
  },
  // Detailed passenger information
  passengerDetails: [passengerSchema],
  // Contact information
  contactDetails: contactSchema,
  // Selected seat assignments
  seatAssignments: [{ type: String }],
  // Meal selections
  meals: {
    type: Map,
    of: Number,
    default: {}
  },
  // Baggage selections
  baggage: [{ type: String }],
  // Pricing breakdown
  pricing: pricingSchema,
  // Payment method used
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank'],
    default: 'card'
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    // Generate a unique booking reference: BK-XXXXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference;
    let isUnique = false;

    while (!isUnique) {
      reference = 'BK-';
      for (let i = 0; i < 6; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if reference already exists
      const existing = await this.constructor.findOne({ bookingReference: reference });
      if (!existing) {
        isUnique = true;
      }
    }

    this.bookingReference = reference;
  }
  next();
});

// Virtual to rename userId to user for frontend compatibility
bookingSchema.virtual('user').get(function() {
  return this.userId;
});

// Virtual to rename flightId to flight for frontend compatibility
// Returns flightId if populated, otherwise returns flightDetails
bookingSchema.virtual('flight').get(function() {
  return this.flightId || this.flightDetails;
});

// Ensure virtuals are included in JSON output
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
