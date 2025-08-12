const express = require('express');
const router = express.Router();
const ApplicationController = require('../controller/ApplicationController');
const auth = require('../middleware/Auth');
const authorize = require('../middleware/authorize');
// Route to apply to an offer
router.post('/apply/:offerId', auth,  authorize('candidate'), ApplicationController.applyToOffer);

// Export the router
module.exports = router;