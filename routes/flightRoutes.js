const express = require('express');
const {
  getFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
  searchFlights
} = require('../controllers/flightController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /flights:
 *   get:
 *     summary: Get all flights (with optional filters)
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filter by origin city
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination city
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by departure date
 *     responses:
 *       200:
 *         description: List of flights retrieved successfully
 *   post:
 *     summary: Create a new flight (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Flight'
 *     responses:
 *       201:
 *         description: Flight created successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
router
  .route('/')
  .get(getFlights)
  .post(protect, authorize('admin'), createFlight);

/**
 * @swagger
 * /flights/search/external:
 *   get:
 *     summary: Search flights using Google Flights API (SerpAPI)
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: departure_id
 *         schema:
 *           type: string
 *         description: Departure airport code (e.g., CAI for Cairo)
 *       - in: query
 *         name: arrival_id
 *         schema:
 *           type: string
 *         description: Arrival airport code (e.g., DXB for Dubai)
 *       - in: query
 *         name: outbound_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *       - in: query
 *         name: return_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Return date for round trip (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [1, 2, 3]
 *         description: Flight type (1=Round trip, 2=One way, 3=Multi-city)
 *     responses:
 *       200:
 *         description: Flight search results from Google Flights
 *       500:
 *         description: SerpAPI error or configuration issue
 */
router.route('/search/external').get(searchFlights);

/**
 * @swagger
 * /flights/{id}:
 *   get:
 *     summary: Get single flight by ID
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flight ID
 *     responses:
 *       200:
 *         description: Flight details retrieved
 *       404:
 *         description: Flight not found
 *   put:
 *     summary: Update flight (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               availableSeats:
 *                 type: number
 *     responses:
 *       200:
 *         description: Flight updated successfully
 *       403:
 *         description: Admin access required
 *   delete:
 *     summary: Delete flight (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flight deleted successfully
 *       403:
 *         description: Admin access required
 */
router
  .route('/:id')
  .get(getFlight)
  .put(protect, authorize('admin'), updateFlight)
  .delete(protect, authorize('admin'), deleteFlight);

module.exports = router;
