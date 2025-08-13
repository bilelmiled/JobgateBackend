const Offer = require('../models/OfferModel'); 
const User = require('../models/UserModel'); 

// Créer une offre
const createOffer = async (req, res) => {
  try {
    const companyId = req.user.id; // L'ID de l'utilisateur connecté (doit être une entreprise)
    const { title, description, category, contractType, skillsRequired } = req.body;

    // Validation simple des champs requis
    if (!title || !description || !companyId) {
      return res.status(400).json({ message: 'Title, description and companyId are required' });
    }
    if (req.user.role !== 'company') {
  return res.status(403).json({ message: "Only companies can create offers" });
}


    // Créer la nouvelle offre
    const newOffer = new Offer({
        title,
        description,
        company: companyId,
        category,

        contractType,
        skillsRequired
        });
    await newOffer.save();
    await User.findByIdAndUpdate(companyId,
      {$push :{offers: newOffer._id}}
    );
    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
  } catch (err) {
    res.status(500).json({ message: 'Offer creation error', error: err.message });
  }
}

const validateOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can validate offers" });
    }
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Logique de validation de l'offre (par exemple, changer son statut)
    offer.published = true; // Exemple de mise à jour du statut
    await offer.save();

    res.status(200).json({ message: 'Offer validated successfully', offer });
  } catch (err) {
    res.status(500).json({ message: 'Offer validation error', error: err.message });
  }
}

const deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const companyId = req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Only companies can delete their offers" });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.company.toString() !== companyId) {
      return res.status(403).json({ message: 'You can only delete your own offers' });
    }
    await Offer.findByIdAndDelete(offerId);
    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Offer deletion error', error: err.message });
  }
}

const getOffersByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const offers = await Offer.find({ company: companyId }).populate('company','companyName'); 
    res.status(200).json({ message: 'Offers retrieved successfully', offers });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving offers', error: err.message });
  }
}

const getOfferById = async (req, res) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId).populate('company', 'companyName').populate('comments','content');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.status(200).json({ message: 'Offer retrieved successfully', offer });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving offer', error: err.message });
  } 
}

const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('company', 'companyName').populate('comments','content');
    res.status(200).json({ message: 'Offers retrieved successfully', offers });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving offers', error: err.message });
  }
}

const modifyOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const { title, description, category, contractType, skillsRequired } = req.body;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Only companies can modify their offers" });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only modify your own offers' });
    }

    // Mettre à jour les champs de l'offre
    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.category = category || offer.category;
    offer.contractType = contractType || offer.contractType;
    offer.skillsRequired = skillsRequired || offer.skillsRequired;

    await offer.save();
    res.status(200).json({ message: 'Offer modified successfully', offer });
  } catch (err) {
    res.status(500).json({ message: 'Offer modification error', error: err.message });
  }
}

const addOfferToFavorites = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    // Ajouter l'offre aux favoris de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favoriteOffers: offerId }
    });
    res.status(200).json({ message: 'Offer added to favorites successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding offer to favorites', error: err.message });
  }
}

const removeOfferFromFavorites = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    } 
    // Retirer l'offre des favoris de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $pull: { favoriteOffers: offerId }
    });
    res.status(200).json({ message: 'Offer removed from favorites successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing offer from favorites', error: err.message });
  }
}

module.exports = {
  createOffer,
  validateOffer,
  deleteOffer,
  getOffersByCompany,
  getOfferById,
  getAllOffers,
  modifyOffer,
  addOfferToFavorites,
  removeOfferFromFavorites
}