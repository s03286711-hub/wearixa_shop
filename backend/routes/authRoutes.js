const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    forgotPassword,
    resetPassword,
    googleAuth,
    updateUserRole,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id')
    .delete(protect, admin, deleteUser);
router.route('/users/:id/role')
    .put(protect, admin, updateUserRole);

module.exports = router;
