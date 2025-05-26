const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // 'Bearer tokenstring'

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // this will have { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = auth;
