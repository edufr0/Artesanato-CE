const { Pool } = require('pg');

module.exports = new Pool({
  user: 'postgres',
  password: 'COLOQUE SUA SENHA',
  host: 'localhost',
  port: 5432,
  database: 'launchstore'
});
