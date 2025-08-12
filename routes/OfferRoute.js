
const express = require('express');

const router = express.Router();
const OfferController = require('../controller/OfferController');
const auth = require('../middleware/Auth');
const authorize = require('../middleware/authorize');

router.post('/createOffer', auth, authorize('company'), OfferController.createOffer); 
router.put('/validateOffer/:id', auth, authorize('admin'), OfferController.validateOffer);
router.delete('/deleteOffer/:id', auth, authorize('company'), OfferController.deleteOffer);
router.get('/offersByCompany/:companyId', OfferController.getOffersByCompany);
router.get('/offer/:id', auth, OfferController.getOfferById);
router.get('/allOffers', OfferController.getAllOffers);
router.put('/modifyOffer/:id', auth, authorize('company'), OfferController.modifyOffer);


module.exports = router;