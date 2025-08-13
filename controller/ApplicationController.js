const Application = require('../models/ApplicationModel');
const Offer = require('../models/OfferModel'); // Assure-toi que ton modèle est bien dans ce chemin
const User = require('../models/UserModel'); // Assure-toi que ton modèle est bien dans ce chemin

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
await User.findByIdAndUpdate(userId, {
  $push: { applications: application._id }
});

    res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (err) {
    res.status(500).json({ message: 'Error applying to offer', error: err.message });
  }
}

const getApplicationsByOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    // Check if the user is authorized to view applications for this offer
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only companies or admins can view applications for this offer' });
    }
    // Check if the offer exists
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    } 
    // Retrieve applications for the offer
    const applications = await Application.find({ offer: offerId })
      .populate('candidate') 
      .populate('offer'); 
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving applications', error: err.message });
  }
}

const getApplicationByOfferByCandidate = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const userId = req.user.id;
    // Check if the offer exists
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    } 
    // Retrieve the application for the offer by the candidate
    const application = await Application.findOne({ offer: offerId, candidate: userId })
      .populate('candidate') 
      .populate('offer'); 
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json(application);
  }
  catch (err) {
    res.status(500).json({ message: 'Error retrieving application', error: err.message });
  }
}

const deleteApplicationByCompany = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    // Check if the application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    } 
    // Check if the user is the company that posted the offer
    const offer = await Offer.findById(application.offer);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.company.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this application' });
    }
    // Delete the application
    await Application.findByIdAndDelete(applicationId);
    // Remove the application from the offer's applications array
    await Offer.findByIdAndUpdate(application.offer, {
      $pull: { applications: applicationId }
    });
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting application', error: err.message });
  }
}

const acceptApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    // Check if the application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Check if the user is the company that posted the offer
    const offer = await Offer.findById(application.offer);  
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.company.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to accept this application' });
    }
    // Update the application status to accepted
    application.status = 'accepted';
    await application.save();
    res.status(200).json({ message: 'Application accepted successfully', application });
  }
  catch (err) {
    res.status(500).json({ message: 'Error accepting application', error: err.message });
  }
}

const rejectApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    // Check if the application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Check if the user is the company that posted the offer
    const offer = await Offer.findById(application.offer);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.company.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to reject this application' });
    }
    // Update the application status to rejected
    application.status = 'rejected';
    await application.save();
    res.status(200).json({ message: 'Application rejected successfully', application });
  }
  catch (err) {
    res.status(500).json({ message: 'Error rejecting application', error: err.message });
  }
}
const getApplicationsByCandidate = async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can retrieve their applications' });
    }

    const applications = await Application.find({ candidate: userId })
      .populate('offer','_id'); 
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving applications', error: err.message });
  }
}

module.exports = {
  applyToOffer,
  getApplicationsByOffer,
  getApplicationByOfferByCandidate,
  deleteApplicationByCompany,
  acceptApplication,
  rejectApplication,
  getApplicationsByCandidate
}