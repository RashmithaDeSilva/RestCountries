import sqlite3 from "sqlite3";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

async function initializeDatabase() {
    try {
        if (process.env.ENV === "PROD") {
            const connection = await mysql2.createConnection({
                host: process.env.MYSQL_DB_HOST || "localhost",
                user: process.env.MYSQL_DB_USER || "root",
                password: process.env.MYSQL_DB_PASSWORD || "12345",
            });

            await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "cw1"}`);
            await connection.end();
            console.log("[INFO] - Database ensured");

            pool = mysql2.createPool({
                host: process.env.MYSQL_DB_HOST || "localhost",
                user: process.env.MYSQL_DB_USER || "root",
                password: process.env.MYSQL_DB_PASSWORD || "12345",
                database: process.env.DB_NAME || "cw1",
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
            });
            console.log("[INFO] - MySQL Connection Pool Initialized");

        } else if (process.env.ENV === "DEV") {
            sqlite3.verbose();
            pool = new sqlite3.Database(`./${ process.env.DB_NAME || "dev" }.db`, (err) => {
                if (err) {
                    console.error("[ERROR] - SQLite Connection Failed...", err);
                    process.exit(1);
                } else {
                    console.log("[INFO] - SQLite Connected Successfully");
                }
            });

            // Wrap SQLite in a Promise-based API for consistency
            pool.query = (sql, params = []) => {
                return new Promise((resolve, reject) => {
                    pool.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve([rows]);
                    });
                });
            };
        }

        return pool;
    } catch (error) {
        console.error("[ERROR] - Database Initialization Failed...", error);
        process.exit(1);
    }
}

// Export a function that ensures `pool` is ready
export async function getDatabasePool() {
    if (!pool) {
        await initializeDatabase();
    }
    return pool;
}
