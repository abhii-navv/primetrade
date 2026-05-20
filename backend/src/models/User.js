const pool = require('../config/db');

const createUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
createUsersTable();

const User = {
  findByEmail: async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  findById: async (id) => {
    const res = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async ({ name, email, password, role = 'user' }) => {
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password, role]
    );
    return res.rows[0];
  },

  findAll: async () => {
    const res = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  },
};

module.exports = User;
