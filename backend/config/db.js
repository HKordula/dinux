import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.NODE_ENV === 'test' ? 'dinux_test' : 'dinux';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0,
  timezone: '+00:00',
  decimalNumbers: true,
  namedPlaceholders: true
});

// test database connection on apps startup
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

export default pool;