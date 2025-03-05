import { getDatabasePool } from "./SQLCon.mjs";
import dotenv from "dotenv";

dotenv.config();

async function setupDatabase() {
    const pool = await getDatabasePool();

    if (!pool) {
        console.error("[ERROR] - Database pool is undefined!");
        process.exit(1);
    }

    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users(
                id ${ process.env.ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
                name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            );`
        );
        console.log("[INFO] - Users table created or already exists");
        await pool.end();

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
