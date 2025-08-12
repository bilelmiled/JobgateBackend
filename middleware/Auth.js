// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); 

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token not found' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Malformed token' });
    }

    const token = parts[1];
    const secret = process.env.ACCESS_TOKEN_KEY;
    if (!secret) {
      console.error('ACCESS_TOKEN_KEY not set');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    // vérification du token
    const decoded = jwt.verify(token, secret); // throws si invalide/expiré
    if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid token' });

    // Optionnel mais recommandé : récupérer l'utilisateur en base
    const user = await User.findById(decoded.id).select('-password'); // exclude password
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account not active' });
    }

    req.user = user; // on attache l'objet user complet, pas juste le token décodé
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
