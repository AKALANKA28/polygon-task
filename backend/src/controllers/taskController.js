const pool = require('../config/db');

// Get all tasks (admin: all, employee: own)
exports.getAll = async (req, res, next) => {
  try {
    let query = `
      SELECT t.*, 
        JSON_OBJECT('id', c.id, 'name', c.name) as creator,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url, 'subtask', ta.subtask))
          FROM task_assignees ta
          JOIN users u ON ta.user_id = u.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users c ON t.created_by = c.id
    `;
    const params = [];

    if (req.user.role === 'employee') {
      query += ' WHERE t.id IN (SELECT task_id FROM task_assignees WHERE user_id = ?)';
      params.push(req.user.id);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    const tasks = rows.map(row => ({
      ...row,
      assignees: row.assignees ? (typeof row.assignees === 'string' ? JSON.parse(row.assignees) : row.assignees) : [],
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
        JSON_OBJECT('id', c.id, 'name', c.name) as creator,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url, 'subtask', ta.subtask))
          FROM task_assignees ta
          JOIN users u ON ta.user_id = u.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = {
      ...rows[0],
      assignees: rows[0].assignees ? (typeof rows[0].assignees === 'string' ? JSON.parse(rows[0].assignees) : rows[0].assignees) : [],
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
      'INSERT INTO tasks (title, description, priority, created_by, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, priority || 'medium', req.user.id, due_date || null]
    );
    const taskId = result.insertId;

    let assigneesList = [];
    if (Array.isArray(assigned_to)) {
      assigneesList = assigned_to.map(item => {
        if (typeof item === 'object' && item !== null) {
          return { id: Number(item.id), subtask: item.subtask || null };
        }
        return { id: Number(item), subtask: null };
      });
    } else if (assigned_to) {
      if (typeof assigned_to === 'object' && assigned_to !== null) {
        assigneesList = [{ id: Number(assigned_to.id), subtask: assigned_to.subtask || null }];
      } else {
        assigneesList = [{ id: Number(assigned_to), subtask: null }];
      }
    }

    if (assigneesList.length > 0) {
      const values = assigneesList.map(a => [taskId, a.id, a.subtask]);
      await pool.query('INSERT INTO task_assignees (task_id, user_id, subtask) VALUES ?', [values]);
    }

    const [rows] = await pool.query(
      `SELECT t.*, 
        JSON_OBJECT('id', c.id, 'name', c.name) as creator,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url, 'subtask', ta.subtask))
          FROM task_assignees ta
          JOIN users u ON ta.user_id = u.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [taskId]
    );

    const task = {
      ...rows[0],
      assignees: rows[0].assignees ? (typeof rows[0].assignees === 'string' ? JSON.parse(rows[0].assignees) : rows[0].assignees) : [],
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
    let assigneesList = null;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'assigned_to') {
        if (Array.isArray(value)) {
          assigneesList = value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return { id: Number(item.id), subtask: item.subtask || null };
            }
            return { id: Number(item), subtask: null };
          });
        } else if (value) {
          if (typeof value === 'object' && value !== null) {
            assigneesList = [{ id: Number(value.id), subtask: value.subtask || null }];
          } else {
            assigneesList = [{ id: Number(value), subtask: null }];
          }
        } else {
          assigneesList = [];
        }
      } else if (['title', 'description', 'status', 'priority', 'due_date'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    if (assigneesList !== null) {
      await pool.query('DELETE FROM task_assignees WHERE task_id = ?', [id]);
      if (assigneesList.length > 0) {
        const values = assigneesList.map(a => [id, a.id, a.subtask]);
        await pool.query('INSERT INTO task_assignees (task_id, user_id, subtask) VALUES ?', [values]);
      }
    }

    const [rows] = await pool.query(
      `SELECT t.*, 
        JSON_OBJECT('id', c.id, 'name', c.name) as creator,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url, 'subtask', ta.subtask))
          FROM task_assignees ta
          JOIN users u ON ta.user_id = u.id
          WHERE ta.task_id = t.id
        ) as assignees
      FROM tasks t
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = {
      ...rows[0],
      assignees: rows[0].assignees ? (typeof rows[0].assignees === 'string' ? JSON.parse(rows[0].assignees) : rows[0].assignees) : [],
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
      whereClause = 'WHERE id IN (SELECT task_id FROM task_assignees WHERE user_id = ?)';
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

// Get comments for a task
exports.getComments = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    
    if (req.user.role === 'employee') {
      const [taskRows] = await pool.query(
        'SELECT id FROM tasks WHERE id = ? AND id IN (SELECT task_id FROM task_assignees WHERE user_id = ?)',
        [taskId, req.user.id]
      );
      if (taskRows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this task comments' });
      }
    }

    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Add comment to a task
exports.addComment = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    if (req.user.role === 'employee') {
      const [taskRows] = await pool.query(
        'SELECT id FROM tasks WHERE id = ? AND id IN (SELECT task_id FROM task_assignees WHERE user_id = ?)',
        [taskId, req.user.id]
      );
      if (taskRows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied. You cannot comment on this task' });
      }
    } else {
      const [taskRows] = await pool.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
      if (taskRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, req.user.id, content.trim()]
    );

    const [newCommentRows] = await pool.query(
      `SELECT c.*, u.name as user_name, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newCommentRows[0] });
  } catch (err) {
    next(err);
  }
};
