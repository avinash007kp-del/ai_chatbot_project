const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Please add all fields' });

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return res
        .status(400)
        .json({
          error:
            'Password must contain at least one uppercase letter, one number, and one special character.',
        });
    }

    const { rowCount } = await sql`SELECT 1 FROM users WHERE email = ${email}`;

    if (rowCount > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email
    `;

    const user = rows[0];

    res.status(201).json({
      _id: user.id, // mapped from postgres id to _id for frontend compatibility
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Please add all fields' });

    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, // mapped from postgres id to _id for frontend compatibility
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};
