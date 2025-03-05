import sqlite3 from 'sqlite3';
import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

async function initializeDatabase() {
    try {
        const connection = await mysql2.createConnection({
            host: process.env.MSQL_DB_HOST || "localhost",
            user: process.env.MSQL_DB_USER || "root",
            password: process.env.MSQL_DB_PASSWORD || "12345"
        });
        
        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${ process.env.DB_NAME || "cw1" }`);
        await connection.end();

        console.log('[INFO] - Database ensured');
        
        // Create connection pool
        pool = mysql2.createPool({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "12345",
            database: process.env.DB_NAME || "cw1",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        const testConnection = await pool.getConnection();
        console.log('[INFO] - MySQL Connected Successfully!');
        testConnection.release();

    } catch (error) {
        console.error('[ERROR] - MySQL Connection Failed...', error);
        process.exit(1); // Exit process if connection fails
    }
}

if (process.env.ENV === "PROD") {
    await initializeDatabase();

} else if (process.env.ENV === "DEV") {
    sqlite3.verbose(); // Enable verbose mode for debugging
    pool = new sqlite3.Database(`./${ process.env.DB_NAME }.db`, (err) => {
        if (err) {
            console.error('[ERROR] - SQLite Connection Failed...', err);
            process.exit(1);
            
        } else {
            console.log('[INFO] - SQLite Connected Successfully!');
        }
    });
}

export default pool;
