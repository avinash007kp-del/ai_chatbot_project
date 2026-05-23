const { sql } = require('@vercel/postgres');

const initDB = async () => {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create chats table if it doesn't exist
    // messages will be stored as JSONB to easily support the chat structure
    await sql`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT 'New Chat',
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Postgres DB Initialized');
  } catch (error) {
    console.error(`Error connecting to Postgres: ${error.message}`);
    // Only exit if not running in Vercel serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = initDB;
