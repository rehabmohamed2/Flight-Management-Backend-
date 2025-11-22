const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Send contact form email to admin
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Sender's name
 *               email:
 *                 type: string
 *                 description: Sender's email address
 *               subject:
 *                 type: string
 *                 description: Message subject (optional)
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', sendContactEmail);

module.exports = router;
