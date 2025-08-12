const { default: mongoose } = require('mongoose');

const applicationSchema = new mongoose.Schema({
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    testScore: { type: Number, default: null },
    dateApplied: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
