const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function() { return this.authProvider === 'local'; },
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'facebook'],
            default: 'local',
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        walletBalance: {
            type: Number,
            required: true,
            default: 0,
        },
        role: {
            type: String,
            required: true,
            default: 'user',
            enum: ['user', 'admin'],
        },
        address: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String,
        cardLast4: String,
        cardBrand: String,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
