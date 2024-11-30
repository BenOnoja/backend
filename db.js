const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for ElephantSQL
  },
});

// Prevent multiple calls to createTables
let tablesCreated = false;

const createTables = async () => {
  if (tablesCreated) {
    return; // Exit if tables are already created
  }

  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reading_progress (
            id SERIAL PRIMARY KEY,
            book_id INTEGER NOT NULL,
            telegram_user_id BIGINT NOT NULL,
            current_page INTEGER DEFAULT 1,
            last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT reading_progress_book_id_telegram_user_id_key UNIQUE (book_id, telegram_user_id),
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id)
        );

        CREATE TABLE IF NOT EXISTS users (
            telegram_user_id BIGINT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT,
            username TEXT,
            profile_picture_url VARCHAR(200),
            role TEXT CHECK (role IN ('Buyer', 'Seller', 'Both')),
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_by BIGINT REFERENCES users(telegram_user_id),
            cover_photo_path VARCHAR(200),
            genre TEXT,
            webtoons BOOLEAN DEFAULT FALSE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id),
            buyer_id BIGINT REFERENCES users(telegram_user_id),
            transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            amount NUMERIC(10, 2) NOT NULL,
            proof_of_payment_code VARCHAR(6),
            reference VARCHAR(20),
            has_paid BOOLEAN DEFAULT FALSE
        );

        CREATE TABLE IF NOT EXISTS bookreviews (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id),
            user_id BIGINT REFERENCES users(telegram_user_id),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            review_text TEXT,
            review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    tablesCreated = true; // Set flag to true after tables are created
    console.log('Tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = {
  pool,
  createTables,
};