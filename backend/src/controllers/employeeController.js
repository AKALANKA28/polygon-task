const pool = require('../config/db');

// Get all employees with task counts
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.department, u.phone, u.created_at,
        COUNT(t.id) as taskCount,
        SUM(t.status = 'completed') as completedCount,
        SUM(t.status = 'pending') as pendingCount,
        SUM(t.status = 'in_progress') as inProgressCount
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
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
      'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC',
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
      FROM tasks WHERE assigned_to = ?`,
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
