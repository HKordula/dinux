require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    req.user = users[0];
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: users[0].id, role: users[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/dinos', async (req, res) => {
  try {
    const filters = getDinosaurFilters(req.query);
    const [dinosaurs] = await pool.query(`
      SELECT d.*, s.name as species, e.name as era, di.name as diet 
      FROM dinosaurs d
      LEFT JOIN species s ON d.species_id = s.id
      LEFT JOIN eras e ON d.era_id = e.id
      LEFT JOIN diets di ON d.diet_id = di.id
      ${filters.whereClause}
    `, filters.params);
    
    res.json(dinosaurs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/dinos', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, species_id, era_id, diet_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO dinosaurs (name, species_id, era_id, diet_id) VALUES (?, ?, ?, ?)',
      [name, species_id, era_id, diet_id]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

function getDinosaurFilters(queryParams) {
  const validFilters = ['species', 'diet', 'era'];
  const conditions = [];
  const params = [];

  validFilters.forEach(filter => {
    if (queryParams[filter]) {
      conditions.push(`${filter} = ?`);
      params.push(queryParams[filter]);
    }
  });

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));