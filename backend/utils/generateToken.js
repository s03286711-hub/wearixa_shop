const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123_fallback_set_env_var', {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
