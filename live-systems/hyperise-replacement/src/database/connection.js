import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hyperise_replacement',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export database instance
export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  end: () => pool.end(),
  pool
};

// Database utility functions
export const dbUtils = {
  // Execute transaction
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Insert with returning
  async insert(table, data, returning = '*') {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update with returning
  async update(table, data, where, returning = '*') {
    const setColumns = Object.keys(data).map((key, index) => `${key} = $${index + 1}`);
    const whereColumns = Object.keys(where).map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`);
    
    const query = `
      UPDATE ${table}
      SET ${setColumns.join(', ')}
      WHERE ${whereColumns.join(' AND ')}
      RETURNING ${returning}
    `;
    
    const values = [...Object.values(data), ...Object.values(where)];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find by conditions
  async find(table, where = {}, options = {}) {
    let query = `SELECT ${options.select || '*'} FROM ${table}`;
    const values = [];
    
    if (Object.keys(where).length > 0) {
      const whereColumns = Object.keys(where).map((key, index) => {
        values.push(where[key]);
        return `${key} = $${index + 1}`;
      });
      query += ` WHERE ${whereColumns.join(' AND ')}`;
    }
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }
    
    const result = await pool.query(query, values);
    return options.single ? result.rows[0] : result.rows;
  },

  // Count records
  async count(table, where = {}) {
    let query = `SELECT COUNT(*) FROM ${table}`;
    const values = [];
    
    if (Object.keys(where).length > 0) {
      const whereColumns = Object.keys(where).map((key, index) => {
        values.push(where[key]);
        return `${key} = $${index + 1}`;
      });
      query += ` WHERE ${whereColumns.join(' AND ')}`;
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  },

  // Delete records
  async delete(table, where) {
    const whereColumns = Object.keys(where).map((key, index) => `${key} = $${index + 1}`);
    const query = `DELETE FROM ${table} WHERE ${whereColumns.join(' AND ')}`;
    const result = await pool.query(query, Object.values(where));
    return result.rowCount;
  }
};

export default db;
