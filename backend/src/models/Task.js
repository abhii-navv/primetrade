const pool = require('../config/db');

const createTasksTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
createTasksTable();

const Task = {
  findAllByUser: async (userId) => {
    const res = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows;
  },

  findAll: async () => {
    const res = await pool.query(
      `SELECT tasks.*, users.name as owner_name FROM tasks
       JOIN users ON tasks.user_id = users.id
       ORDER BY tasks.created_at DESC`
    );
    return res.rows;
  },

  findById: async (id) => {
    const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async ({ title, description, userId }) => {
    const res = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, userId]
    );
    return res.rows[0];
  },

  update: async (id, { title, description, status }) => {
    const res = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, description, status, id]
    );
    return res.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  },
};

module.exports = Task;
