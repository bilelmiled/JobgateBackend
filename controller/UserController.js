const { default: mongoose } = require('mongoose');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require ("../utils/SendEmail") 


// Helper : Générer Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, status: user.status },
    process.env.ACCESS_TOKEN_KEY    ,
    { expiresIn: '24h' }
  );
};

// Helper : Générer Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: '7d' }
  );
};

let RefreshTokens = [];

const createUserPublic = async (req, res) => {
  try {
     const {
      fullname,
      email,
      password,
      phone,
      role,
      skills,
      companyName,
      speciality,
      description,
      
    } = req.body;

    // Validation simple du role public autorisé
    const allowedRoles = ['candidate', 'company'];
    const roleToSet = allowedRoles.includes(role) ? role : 'candidate';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      phone,
      role: roleToSet,
      status: 'active',
      skills: skills || [],
      companyName: companyName || '',
      speciality: speciality || '',
      description: description || '',
    });

    await newUser.save();

    // Ne pas retourner le mot de passe
    const userSafe = newUser.toObject();
    delete userSafe.password;

    res.status(201).json({ message: 'User created successfully', user: userSafe });
  } catch (err) {
    res.status(500).json({ message: 'User creation error', error: err.message });
  }
};

// creation admin user
const createUserAdmin = async (req, res) => {
  try {
    const { fullname, email, password, phone, role } = req.body;

    

    const allowedRoles = ['admin', 'candidate', 'company', 'guest'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();

    const userSafe = newUser.toObject();
    delete userSafe.password;

    res.status(201).json({ message: 'User created successfully', user: userSafe });
  } catch (err) {
    res.status(500).json({ message: 'User creation error', error: err.message });
  }
};


// Connexion utilisateur
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Vérifier status user
    if (user.status !== 'active') {
      return res.status(403).json({ message: `User status is '${user.status}', access denied.` });
    }

    // Vérifier password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Générer tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    RefreshTokens.push(refreshToken);

    // User safe
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(200).json({ accessToken, refreshToken, user: userSafe });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// Récupérer utilisateurs par rôle
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).populate('offers').populate('applications');

    if (users.length === 0) {
      return res.status(404).json({ message: `No users found with role ${role}` });
    }

    // Supprimer password de chaque user
    const safeUsers = users.map(user => {
      const u = user.toObject();
      delete u.password;
      return u;
    });

    res.status(200).json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Déconnexion (logout)
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: 'Refresh token is required' });

    if (!RefreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Invalid refresh token' });

    RefreshTokens = RefreshTokens.filter(token => token !== refreshToken);

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout error', error: error.message });
  }
};

// Récupérer détails utilisateur connecté
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(200).json(userSafe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Sauvegarder dans la base avec expiration
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // expire dans 10 min
    await user.save();

    // Préparer l’email
    const htmlMessage = `
      <h2>Hello ${user.fullname}</h2>
      <p>Voici votre code de réinitialisation :</p>
      <h1>${code}</h1>
      <p>Ce code est valide pendant 10 minutes.</p>
    `;
    const subject = "Réinitialisation de votre mot de passe";

    // Envoyer l’email
    const emailSent = await sendEmail(user.email, subject, htmlMessage);

    if (emailSent) {
      return res.status(200).json({ message: "Reset code sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send email" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Vérifier si le code est correct et non expiré
    if (
      user.resetCode !== code ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, email, password } = req.body;
    const updatedData = { fullname, email };
    // Si l'image est envoyée avec le champ 'image' (via multer)
    if (req.file) {
      // Ici tu peux stocker juste le nom ou le chemin complet
      updatedData.image = `/uploads/${req.file.filename}`;
    }
    // Si mot de passe présent, on le hashe
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }
    // Mise à jour du profil
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: err.message
    });
  }
};

const addSkillToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;
    // Vérifier si le skill est déjà présent
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.skills.includes(skill)) {
      return res.status(400).json({ message: 'Skill already exists' });
    }
    // Ajouter le skill
    user.skills.push(skill);
    await user.save();
    res.status(200).json({ message: 'Skill added successfully', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Error adding skill', error: err.message });
  }
};

module.exports = {
  createUserPublic,
  createUserAdmin,
  loginUser,
  getUsersByRole,
  logoutUser,
  getUserDetails,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  addSkillToUser
};
