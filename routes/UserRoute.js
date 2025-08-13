const express = require('express');

const router = express.Router();
const UserController = require('../controller/UserController');
const auth = require('../middleware/Auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');


router.post('/createAdmin', auth, authorize('admin') ,UserController.createUserAdmin); // Admin can create users
router.post('/createUserPublic', UserController.createUserPublic); // Public can create user
router.post('/login', UserController.loginUser);
router.get('/getUsersByRole/:role', UserController.getUsersByRole);
router.post('/logout', UserController.logoutUser);
router.get('/details',auth ,UserController.getUserDetails);
router.post('/forgotPassword', UserController.forgotPassword); // Endpoint for forgot password
router.post('/resetPassword', UserController.resetPassword); // Endpoint for reset password
router.put('/updateProfile', auth,upload.single("image"), UserController.updateUserProfile); // Endpoint to update user profile
router.put('/addSkillToUser', auth, UserController.addSkillToUser); // Endpoint to add skill to user



module.exports = router;