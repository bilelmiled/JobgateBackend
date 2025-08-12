const { default: mongoose } = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    resetToken: { type: String, default: null },
    image: { type: String, default: null },
    role: { type: String, enum: ['admin', 'candidate', 'company', 'guest'], default: 'guest' },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'banned'], default: 'active' },

    // Candidate
    skills: [String],
    level: { type: Number, default: 0 },
    recommendations: [{
        fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],

    // Company
    companyName: String,
    speciality: String,
    description: String,
    offers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],

    // Champs pour le reset via code OTP
  resetCode: { type: String }, // code à 6 chiffres
  resetCodeExpires: { type: Date } // date d’expiration

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
