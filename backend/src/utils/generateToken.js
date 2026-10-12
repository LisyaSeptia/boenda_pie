const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET || 'boenda_pie_purwokerto_super_secret_jwt_key_2026',
    {
      expiresIn: '1d'
    }
  );
};

module.exports = generateToken;
