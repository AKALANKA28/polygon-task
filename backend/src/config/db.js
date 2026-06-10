require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'polygon_tasks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Database comments table checked/created successfully');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        subtask VARCHAR(500) DEFAULT NULL,
        PRIMARY KEY (task_id, user_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Database task_assignees table checked/created successfully');

    try {
      await pool.query('ALTER TABLE task_assignees ADD COLUMN subtask VARCHAR(500) DEFAULT NULL');
      console.log('Successfully checked/added subtask column to task_assignees.');
    } catch (err) {
      // Ignore if column already exists
    }

    // Migrate existing assignments from tasks.assigned_to to task_assignees if table is empty
    const [assigneeCountRows] = await pool.query('SELECT COUNT(*) as count FROM task_assignees');
    if (assigneeCountRows[0].count === 0) {
      const [tasksWithAssignees] = await pool.query('SELECT id, assigned_to FROM tasks WHERE assigned_to IS NOT NULL');
      if (tasksWithAssignees.length > 0) {
        for (const t of tasksWithAssignees) {
          await pool.query('INSERT IGNORE INTO task_assignees (task_id, user_id) VALUES (?, ?)', [t.id, t.assigned_to]);
        }
        console.log(`Successfully migrated ${tasksWithAssignees.length} task assignments to task_assignees.`);
      }
    }
  } catch (err) {
    console.error('Failed to initialize database tables or run migrations:', err);
  }
}
initDb();

module.exports = pool;
