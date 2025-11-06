const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(role = null) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload; // { id, role, name, ... }
      if (role && payload.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = { requireAuth };