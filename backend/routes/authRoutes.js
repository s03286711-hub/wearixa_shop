const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', (req, res) => {
    // Basic implementation for now to avoid 404
    const { email } = req.body;
    console.log(`Password reset requested for: ${email}`);
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
});
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);

module.exports = router;
