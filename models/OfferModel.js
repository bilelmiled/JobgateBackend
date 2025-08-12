const { default: mongoose } = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    contractType: { type: String, enum: ['CDI', 'CDD', 'Freelance', 'Stage'], required: true },
    skillsRequired: [String],
    published: { type: Boolean, default: false }, // Validé par l'admin
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);

