import sqlite3 from "sqlite3";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { LogTypes } from "../utils/enums/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();
const MYSQL_DB_HOST = process.env.MYSQL_DB_HOST || "localhost";
const MYSQL_DB_USER = process.env.MYSQL_DB_USER || "root";
const MYSQL_DB_PASSWORD = process.env.MYSQL_DB_PASSWORD || "12345";
const DB_NAME = process.env.DB_NAME || "cw1";
const ENV = process.env.ENV;

// Get the absolute path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct absolute path to the SQL file
const sqlFilePath = path.join(__dirname, ENV === "PROD" ? "./sql_scripts/mysql.sql" : "./sql_scripts/sqlite.sql");
const SQL_SCRIPT = readFileSync(sqlFilePath, "utf8");

let pool;

async function initializeDatabase() {
    try {
        if (ENV === "PROD") {
            // Create connection
            const connection = await mysql2.createConnection({
                host: MYSQL_DB_HOST,
                user: MYSQL_DB_USER,
                password: MYSQL_DB_PASSWORD,
                multipleStatements: true,
            });

            // Setup database
            await connection.query(SQL_SCRIPT);
            await connection.end();
            log(LogTypes.INFO, "Database setup finished");

            // Create connection pool
            pool = mysql2.createPool({
                host: MYSQL_DB_HOST,
                user: MYSQL_DB_USER,
                password: MYSQL_DB_PASSWORD,
                database: DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
            });
            log(LogTypes.INFO, "MySQL Connection Pool Initialized");

        } else if (process.env.ENV === "DEV") {
            // Create connection pool
            sqlite3.verbose();
            pool = new sqlite3.Database(`./${ DB_NAME }.db`, (err) => {
                if (err) {
                    log(LogTypes.ERROR, `SQLite Connection Failed ${ err }`);
                    process.exit(1);
                } else {
                    log(LogTypes.INFO, "SQLite Connected Successfully");
                }
            });

            // Setup database
            pool.exec(SQL_SCRIPT);
            log(LogTypes.INFO, "Database setup finished");

            // Wrap SQLite in a Promise-based API for consistency
            pool.query = (sql, params = []) => {
                return new Promise((resolve, reject) => {
                    pool.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve([rows]);
                    });
                });
            };
            log(LogTypes.INFO, "SQLite Connection Pool Initialized");
        }

        return pool;
    } catch (error) {
        log(LogTypes.ERROR, `Database Initialization Failed ${ error }`);
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
