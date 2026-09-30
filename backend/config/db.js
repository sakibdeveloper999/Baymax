const database = require('../db/pool');
module.exports = async function connectDB() {
    await database.query('SELECT 1');
    const result = await database.query("SELECT to_regclass('public.schema_migrations') AS migrations");
    if (!result.rows[0].migrations) throw new Error('PostgreSQL schema is missing. Run npm run db:migrate in backend first.');
    const { rows } = await database.query('SELECT name FROM schema_migrations WHERE name = $1', ['001_initial.sql']);
    if (!rows.length) throw new Error('PostgreSQL migration is missing. Run npm run db:migrate in backend first.');
    console.log('PostgreSQL connected');
};
