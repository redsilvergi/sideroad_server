const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/authMiddleware');

const config_obj = require('../config/config');
const { Pool } = require('pg');

// CONNECTION -----------------------------------------------------
const dbconn = () => {
  const client = new Pool(config_obj.dbConfig);
  return client;
};
const client = dbconn();

// router ------------------------------------------------------------
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('/auth /login called\n');
    // console.log('/auth username\n', username);
    // console.log('/auth password\n', password);
    // console.log('/auth typeof password\n', typeof password);

    const result = await client.query(
      'select * from users where username = $1',
      [username]
    );
    // console.log('/auth result\n', result);

    const user = result.rows[0];
    console.log('/auth user\n', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid User' });
    }

    // console.log('/auth usercheck passed');

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Password' });
    }

    // console.log('/auth passwordisMatch passed');

    // generate jwt
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config_obj.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    // console.log('/auth tokenJWT passed');

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: `Login Failed\n, ${err}` });
  }
});

// Protected Route Example
router.get('/test_authMiddleware', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!` });
});

module.exports = router;
