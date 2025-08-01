const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');

const secretKey = "kajdakdoermjsfsfskfjswoeidm";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ msg: 'Access token required' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await User.findOne({ email: decoded.email }).select('-password');

    if (!user) {
      return res.status(401).json({ msg: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ msg: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ msg: 'Token expired' });
    }
    return res.status(403).json({ msg: 'Invalid token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(403).json({ msg: 'Admin access required' });
  }
};

module.exports = { authenticateToken, authenticateAdmin }; 