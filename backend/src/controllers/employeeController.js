const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all employees with task counts
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.department, u.phone, u.created_at,
        COUNT(ta.task_id) as taskCount,
        SUM(t.status = 'completed') as completedCount,
        SUM(t.status = 'pending') as pendingCount,
        SUM(t.status = 'in_progress') as inProgressCount
      FROM users u
      LEFT JOIN task_assignees ta ON u.id = ta.user_id
      LEFT JOIN tasks t ON ta.task_id = t.id
      WHERE u.role = 'employee'
      GROUP BY u.id
      ORDER BY u.name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Get employee by ID with their tasks
exports.getById = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, avatar_url, department, phone, created_at FROM users WHERE id = ? AND role = ?',
      [req.params.id, 'employee']
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [tasks] = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN task_assignees ta ON t.id = ta.task_id
       WHERE ta.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...users[0], tasks } });
  } catch (err) {
    next(err);
  }
};

// Get employee stats
exports.getStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'in_progress') as inProgress,
        SUM(status = 'completed') as completed
      FROM tasks t
      JOIN task_assignees ta ON t.id = ta.task_id
      WHERE ta.user_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        employeeId: parseInt(req.params.id),
        total: rows[0].total || 0,
        pending: rows[0].pending || 0,
        inProgress: rows[0].inProgress || 0,
        completed: rows[0].completed || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, department, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Update current user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department } = req.body;
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (department !== undefined) { fields.push('department = ?'); values.push(department); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, department, phone FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Create employee [admin only]
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'employee', department || null, phone || null]
    );

    const newUserId = result.insertId;

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, department, phone, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Update employee [admin only]
exports.updateEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const { name, email, department, phone, password } = req.body;

    // Check if user exists and is an employee
    const [employee] = await pool.query('SELECT id FROM users WHERE id = ? AND role = ?', [employeeId, 'employee']);
    if (employee.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if email is being updated and is already in use by someone else
    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, employeeId]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
    }

    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (department !== undefined) { fields.push('department = ?'); values.push(department); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(employeeId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'employee'`, values);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, department, phone, created_at FROM users WHERE id = ?',
      [employeeId]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Delete employee [admin only]
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;

    // Check if user exists and is an employee
    const [employee] = await pool.query('SELECT id FROM users WHERE id = ? AND role = ?', [employeeId, 'employee']);
    if (employee.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ? AND role = ?', [employeeId, 'employee']);

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
};
