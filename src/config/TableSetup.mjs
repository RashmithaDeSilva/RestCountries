import { getDatabasePool } from "./SQLCon.mjs";
import dotenv from "dotenv";

dotenv.config();
const ENV = process.env.ENV;

async function setupDatabase() {
    const pool = await getDatabasePool();

    if (!pool) {
        console.error("[ERROR] - Database pool is undefined!");
        process.exit(1);
    }

    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS error_logs (
                id ${ ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT" },
                location TEXT NOT NULL,
                message TEXT NOT NULL,
                stack TEXT NOT NULL,
                request_data TEXT NOT NULL,
                timeAndDate ${ ENV === "PROD" ? "DATETIME DEFAULT CURRENT_TIMESTAMP" : "TEXT DEFAULT (CURRENT_TIMESTAMP)" }
            );`
        );
        console.log("[INFO] - Errors table created or already exists");
        
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users (
                id ${ ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT" },
                first_name VARCHAR(50) NOT NULL,
                surname VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                contact_number VARCHAR(20),
                verify BOOLEAN DEFAULT FALSE,
                password_hash VARCHAR(255) NOT NULL
            );`
        );
        console.log("[INFO] - Users table created or already exists");

        if (process.env.ENV === 'PROD') {
            await pool.end();
        }

    } catch (error) {
        console.error("[ERROR] - Failed to create users table:", error);
        process.exit(1);
    }
}

await setupDatabase().catch((err) => {
    console.error("[ERROR] - Setup Database Failed:", err);
    process.exit(1);
});

console.log("[INFO] - Database setup finished");
