const { default: mongoose } = require('mongoose');

const commentSchema = new mongoose.Schema({
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);