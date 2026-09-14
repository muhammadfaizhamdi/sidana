import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'faiz123',
  host: '127.0.0.1',
  port: 5432,
  database: 'sidana',
  connectionTimeoutMillis: 5000,
});

export default pool;