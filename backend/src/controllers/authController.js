const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt received for email: ${email}`);

    if (!email || !password) {
      console.warn(`[AUTH] Missing email or password in request`);
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log(`[AUTH] Querying database for user: ${email}...`);
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log(`[AUTH] Database query completed. Found ${rows.length} matching rows.`);

    if (rows.length === 0) {
      console.warn(`[AUTH] No user found with email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    console.log(`[AUTH] Comparing password hashes...`);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH] Password comparison result: ${isMatch}`);

    if (!isMatch) {
      console.warn(`[AUTH] Password mismatch for user: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`[AUTH] Password matched. Generating JWT...`);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log(`[AUTH] JWT generated successfully. Responding to client.`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(`[AUTH ERROR] An error occurred during login:`, err);
    next(err);
  }
};
