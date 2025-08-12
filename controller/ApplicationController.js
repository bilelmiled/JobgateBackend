const Application = require('../models/ApplicationModel');
const Offer = require('../models/OfferModel'); // Assure-toi que ton modèle est bien dans ce chemin

const applyToOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const userId = req.user.id;

    // Check if the offer exists
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    // Check if the user has already applied to this offer
    const existingApplication = await Application.findOne({ offer: offerId, candidate: userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this offer' });
    }   
    if(req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply to offers' });
    }
    // Create a new application
    const application = new Application({
      offer: offerId,
      candidate: userId,
    });
    await application.save();
    // Add the application to the offer's applications array
    await Offer.findByIdAndUpdate(offerId, {
  $push: { applications: application._id }
});

    res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (err) {
    res.status(500).json({ message: 'Error applying to offer', error: err.message });
  }
}

module.exports = {
  applyToOffer,
}