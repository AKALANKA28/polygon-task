const pool = require('../config/db');

// Get all tasks (admin: all, employee: own)
exports.getAll = async (req, res, next) => {
  try {
    let query = `
      SELECT t.*, 
        JSON_OBJECT('id', a.id, 'name', a.name, 'avatar_url', a.avatar_url) as assignee,
        JSON_OBJECT('id', c.id, 'name', c.name) as creator
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN users c ON t.created_by = c.id
    `;
    const params = [];

    if (req.user.role === 'employee') {
      query += ' WHERE t.assigned_to = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    const tasks = rows.map(row => ({
      ...row,
      assignee: typeof row.assignee === 'string' ? JSON.parse(row.assignee) : row.assignee,
      creator: typeof row.creator === 'string' ? JSON.parse(row.creator) : row.creator,
    }));

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// Get task by ID
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
        JSON_OBJECT('id', a.id, 'name', a.name, 'avatar_url', a.avatar_url) as assignee,
        JSON_OBJECT('id', c.id, 'name', c.name) as creator
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = {
      ...rows[0],
      assignee: typeof rows[0].assignee === 'string' ? JSON.parse(rows[0].assignee) : rows[0].assignee,
      creator: typeof rows[0].creator === 'string' ? JSON.parse(rows[0].creator) : rows[0].creator,
    };

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// Create task (admin only)
exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, priority, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, priority || 'medium', assigned_to || null, req.user.id, due_date || null]
    );

    const [rows] = await pool.query(
      `SELECT t.*, 
        JSON_OBJECT('id', a.id, 'name', a.name, 'avatar_url', a.avatar_url) as assignee,
        JSON_OBJECT('id', c.id, 'name', c.name) as creator
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [result.insertId]
    );

    const task = {
      ...rows[0],
      assignee: typeof rows[0].assignee === 'string' ? JSON.parse(rows[0].assignee) : rows[0].assignee,
      creator: typeof rows[0].creator === 'string' ? JSON.parse(rows[0].creator) : rows[0].creator,
    };

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// Update task
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Employee can only update status
    if (req.user.role === 'employee') {
      const allowed = { status: updates.status };
      Object.keys(updates).forEach(k => { if (k !== 'status') delete updates[k]; });
      Object.assign(updates, allowed);
    }

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(id);
    await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query(
      `SELECT t.*, 
        JSON_OBJECT('id', a.id, 'name', a.name, 'avatar_url', a.avatar_url) as assignee,
        JSON_OBJECT('id', c.id, 'name', c.name) as creator
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = {
      ...rows[0],
      assignee: typeof rows[0].assignee === 'string' ? JSON.parse(rows[0].assignee) : rows[0].assignee,
      creator: typeof rows[0].creator === 'string' ? JSON.parse(rows[0].creator) : rows[0].creator,
    };

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// Delete task (admin only)
exports.delete = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// Get task stats
exports.getStats = async (req, res, next) => {
  try {
    let whereClause = '';
    const params = [];

    if (req.user.role === 'employee') {
      whereClause = 'WHERE assigned_to = ?';
      params.push(req.user.id);
    }

    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'in_progress') as inProgress,
        SUM(status = 'completed') as completed
      FROM tasks ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
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
