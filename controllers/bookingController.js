const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const sendEmail = require('../utils/sendEmail');
const generateTicketPDF = require('../utils/generateTicketPDF');

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phoneNumber')
      .populate('flightId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('flightId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('flightId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isOwner = booking.userId && booking.userId._id && booking.userId._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const {
      flightId,
      flightDetails,
      seats,
      passengers,
      passengerDetails,
      contactDetails,
      seatAssignments,
      meals,
      baggage,
      pricing,
      paymentMethod
    } = req.body;

    if (!flightId && !flightDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either flightId or flightDetails'
      });
    }

    // If using database flight (flightId), check availability
    let flight = null;
    if (flightId) {
      flight = await Flight.findById(flightId);

      if (!flight) {
        return res.status(404).json({
          success: false,
          message: 'Flight not found'
        });
      }

      if (flight.availableSeats < seats) {
        return res.status(400).json({
          success: false,
          message: `Only ${flight.availableSeats} seats available`
        });
      }
    }

    const bookingData = {
      seats,
      status: 'confirmed'
    };

    if (req.user && req.user.id) {
      bookingData.userId = req.user.id;
    }

    // Add flightId or flightDetails
    if (flightId) {
      bookingData.flightId = flightId;
    }
    if (flightDetails) {
      bookingData.flightDetails = flightDetails;
    }

    if (passengers) bookingData.passengers = passengers;
    if (passengerDetails) bookingData.passengerDetails = passengerDetails;
    if (contactDetails) bookingData.contactDetails = contactDetails;
    if (seatAssignments) bookingData.seatAssignments = seatAssignments;
    if (meals) bookingData.meals = meals;
    if (baggage) bookingData.baggage = baggage;
    if (pricing) bookingData.pricing = pricing;
    if (paymentMethod) bookingData.paymentMethod = paymentMethod;

    const booking = await Booking.create(bookingData);

    if (flight) {
      flight.availableSeats -= seats;
      await flight.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phoneNumber')
      .populate('flightId');

    if (contactDetails && contactDetails.email) {
      try {
        const pdfBuffer = await generateTicketPDF(populatedBooking);

        const flightInfo = populatedBooking.flightId || populatedBooking.flightDetails || {};

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #F59E0B; margin-top: 0;">Thank you for your booking!</h2>
                <p>Your flight has been successfully booked. Please find your e-ticket attached to this email.</p>

                <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #92400E;">
                    Booking Reference: ${populatedBooking.bookingReference}
                  </p>
                </div>

                <h3 style="color: #374151;">Flight Details:</h3>
                <ul style="color: #6B7280; line-height: 1.8;">
                  <li><strong>Route:</strong> ${flightInfo.from || flightInfo.origin || 'N/A'} → ${flightInfo.to || flightInfo.destination || 'N/A'}</li>
                  <li><strong>Date:</strong> ${flightInfo.departDate || 'N/A'}</li>
                  <li><strong>Flight:</strong> ${flightInfo.airline || 'N/A'} ${flightInfo.flightNumber || ''}</li>
                  <li><strong>Passengers:</strong> ${populatedBooking.seats}</li>
                  ${populatedBooking.pricing ? `<li><strong>Total Paid:</strong> $${populatedBooking.pricing.totalCost}</li>` : ''}
                </ul>

                <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                  Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights.
                </p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>This is an automated confirmation from Flight Management System.</p>
              <p>For any queries, please contact our support team.</p>
            </div>
          </div>
        `;

        await sendEmail({
          email: contactDetails.email,
          subject: `Flight Booking Confirmed - ${populatedBooking.bookingReference}`,
          message: `Your booking ${populatedBooking.bookingReference} has been confirmed. Please find your e-ticket attached.`,
          html: emailHtml,
          attachments: [
            {
              filename: `Flight-Ticket-${populatedBooking.bookingReference}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });

        console.log(`Confirmation email sent to ${contactDetails.email}`);
      } catch (emailError) {
        // Log error but don't fail the booking
        console.error('Failed to send confirmation email:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedBooking,
      bookingReference: populatedBooking.bookingReference
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isOwner = booking.userId && booking.userId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email').populate('flightId');

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    const isOwner = booking.userId && booking.userId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Return seats to flight
    const flight = await Flight.findById(booking.flightId);
    if (flight) {
      flight.availableSeats += booking.seats;
      await flight.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Return seats to flight if booking was not cancelled
    if (booking.status !== 'cancelled') {
      const flight = await Flight.findById(booking.flightId);
      if (flight) {
        flight.availableSeats += booking.seats;
        await flight.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If changing to cancelled, return seats
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const flight = await Flight.findById(booking.flightId);
      if (flight) {
        flight.availableSeats += booking.seats;
        await flight.save();
      }
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
