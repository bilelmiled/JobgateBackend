const express = require('express');
const router = express.Router();
const ApplicationController = require('../controller/ApplicationController');
const auth = require('../middleware/Auth');
const authorize = require('../middleware/authorize');

router.post('/apply/:offerId', auth,  authorize('candidate'), ApplicationController.applyToOffer);
router.get('/offer/:offerId', auth, ApplicationController.getApplicationsByOffer);
router.get('/offer/:offerId/candidate', auth, ApplicationController.getApplicationByOfferByCandidate);
router.delete('/deleteApplication/:applicationId', auth, authorize('company'), ApplicationController.deleteApplicationByCompany);
router.get('/candidate/applications', auth, ApplicationController.getApplicationsByCandidate);
router.put('/application/:applicationId/accept', auth, authorize('company'), ApplicationController.acceptApplication);
router.put('/application/:applicationId/reject', auth, authorize('company'), ApplicationController.rejectApplication);


// Export the router
module.exports = router;