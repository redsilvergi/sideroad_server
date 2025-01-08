const jwt = require('jsonwebtoken');
const myDB = require('../config/config');
const { Pool } = require('pg');

// CONNECTION -----------------------------------------------------
const dbconn = () => {
  const client = new Pool(myDB.dbConfig);
  return client;
};
const client = dbconn();

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await client.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
