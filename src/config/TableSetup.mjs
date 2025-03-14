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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscription_types (
                id ${ENV === "PROD" ? "INT AUTO_INCREMENT PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
                subscription_name VARCHAR(50) NOT NULL,
                subscription_price ${ENV === "PROD" ? "INT" : "INTEGER"} NOT NULL,
                subscription_price_currency VARCHAR(50) NOT NULL,
                api_request_limit ${ENV === "PROD" ? "INT" : "INTEGER"} NOT NULL,
                api_key_limit ${ENV === "PROD" ? "INT" : "INTEGER"} NOT NULL,
                description TEXT,
                function_description TEXT
            );
        `);        
        console.log("[INFO] - Subscription Types table created or already exists");

        await pool.query(`
            INSERT INTO subscription_types 
                (subscription_name, subscription_price, subscription_price_currency, 
                api_request_limit, api_key_limit, description, function_description)
            SELECT 'Free', 0, 'USD', 1000, 1, 'Basic subscription', 'Manages basic user access'
            WHERE NOT EXISTS (SELECT 1 FROM subscription_types WHERE subscription_name = 'Free')
            UNION ALL
            SELECT 'Plus', 10, 'USD', 1000000, 5, 'Premium subscription', 'Provides premium features'
            WHERE NOT EXISTS (SELECT 1 FROM subscription_types WHERE subscription_name = 'Plus')
            UNION ALL
            SELECT 'Pro', 25, 'USD', -1, 10, 'Enterprise subscription', 'Enterprise-level access and controls'
            WHERE NOT EXISTS (SELECT 1 FROM subscription_types WHERE subscription_name = 'Pro');

        `);
        console.log("[INFO] - Subscription Types created or already exists");

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

        await pool.query(
            `CREATE TABLE IF NOT EXISTS api_keys (
                id ${ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
                key_name VARCHAR(50) NOT NULL,
                key VARCHAR(255) UNIQUE NOT NULL,
                user_id ${ENV === "PROD" ? "INT" : "INTEGER"},
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
        );
        console.log("[INFO] - API Keys table created or already exists");

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
