const { default: mongoose } = require('mongoose');

const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number // index de la bonne réponse
    }],
    validated: { type: Boolean, default: false } // Validé par admin
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);