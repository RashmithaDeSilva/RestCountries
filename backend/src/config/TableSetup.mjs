import { getDatabasePool } from "./SQLCon.mjs";
import dotenv from "dotenv";
import { LogTypes } from "../utils/enums/LogTypes.mjs";
import { log } from "../utils/ConsoleLog.mjs";

dotenv.config();
const ENV = process.env.ENV;

async function setupDatabase() {
    const pool = await getDatabasePool();

    if (!pool) {
        log(LogTypes.ERROR, "Database pool is undefined!");
        process.exit(1);
    }

    // Subscription types table
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
    log(LogTypes.INFO, "Subscription Types table created or already exists");

    // Error log table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS error_logs (
            id ${ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
            location TEXT NOT NULL,
            message TEXT NOT NULL,
            stack TEXT NOT NULL,
            request_data TEXT,
            timeAndDate ${ENV === "PROD" ? "DATETIME DEFAULT CURRENT_TIMESTAMP" : "TEXT DEFAULT (CURRENT_TIMESTAMP)"}
        );`
    );
    log(LogTypes.INFO, "Errors table created or already exists");

    // Users table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS users (
            id ${ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
            first_name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            contact_number VARCHAR(20),
            verify BOOLEAN DEFAULT FALSE,
            password_hash VARCHAR(255) NOT NULL
        );`
    );
    log(LogTypes.INFO, "Users table created or already exists");

    // Subscription users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS subscription_users (
            id ${ENV === "PROD" ? "INT AUTO_INCREMENT PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
            subscription_id ${ENV === "PROD" ? "INT" : "INTEGER"},
            user_id ${ENV === "PROD" ? "INT" : "INTEGER"},
            insert_time ${ENV === "PROD" ? "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" : "TEXT DEFAULT CURRENT_TIMESTAMP"},
            expiry_time ${ENV === "PROD" ? "TIMESTAMP DEFAULT (DATE_ADD(NOW(), INTERVAL 30 DAY))" : "TEXT DEFAULT (DATETIME('now', '+30 days'))"},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (subscription_id) REFERENCES subscription_types(id) ON DELETE CASCADE
        );
    `);
    log(LogTypes.INFO, "Subscription Users table created or already exists");

    // API key table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS api_keys (
            id ${ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
            key_name VARCHAR(50) NOT NULL,
            api_key VARCHAR(255) NOT NULL,
            user_id ${ENV === "PROD" ? "INT" : "INTEGER"},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (api_key)
        );`
    );
    log(LogTypes.INFO, "API Keys table created or already exists");

    // API key usage table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS api_key_usage (
            id ${ENV === "PROD" ? "INT PRIMARY KEY AUTO_INCREMENT" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
            key_usage ${ENV === "PROD" ? "INT" : "INTEGER"} NOT NULL,
            user_id ${ENV === "PROD" ? "INT" : "INTEGER"},
            subscription_type_id ${ENV === "PROD" ? "INT" : "INTEGER"},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id) ON DELETE CASCADE
        );
    `);
    log(LogTypes.INFO, "API Keys Usage table created or already exists");

    if (ENV === "PROD") {
        // Set global event scheduler
        await pool.query(`SET GLOBAL event_scheduler = ON;`);
        log(LogTypes.INFO, "Global event scheduler created or already exists");

        // Check expired subscriptions event
        await pool.query(`
            CREATE EVENT IF NOT EXISTS check_expired_subscriptions
            ON SCHEDULE EVERY 1 DAY
            DO
            BEGIN
                UPDATE api_key_usage
                SET subscription_type_id = 1
                WHERE user_id IN (
                    SELECT user_id FROM subscription_users WHERE expiry_time <= NOW()
                );
            END;
        `);
        log(LogTypes.INFO, "Check expired subscriptions event created or already exists");
    }

    if (ENV === "DEV") {
        await pool.query(`
            UPDATE api_key_usage
            SET subscription_type_id = 1
            WHERE user_id IN (
                SELECT user_id FROM subscription_users WHERE expiry_time < CURRENT_TIMESTAMP
            );
        `);
    }
    log(LogTypes.INFO, "Check expired subscriptions event created or already exists");

    // Insert api key usage on new user trigger
    await pool.query(ENV === "PROD" ? `
        CREATE TRIGGER IF NOT EXISTS insert_api_key_usage_on_new_user
        AFTER INSERT ON users
        FOR EACH ROW
        BEGIN
            INSERT IGNORE INTO api_key_usage (user_id, subscription_type_id, key_usage)
            VALUES (NEW.id, 1, 0);
        END;` :
        `CREATE TRIGGER IF NOT EXISTS insert_api_key_usage_on_new_user
        AFTER INSERT ON users
        FOR EACH ROW
        BEGIN
            INSERT OR IGNORE INTO api_key_usage (user_id, subscription_type_id, key_usage)
            VALUES (NEW.id, 1, 0);
        END;`
    );
    log(LogTypes.INFO, "Insert api key usage on new user trigger created or already exists");

    // Subscription users expiry time trigger
    await pool.query(`
        CREATE TRIGGER IF NOT EXISTS set_expiry_time
        AFTER INSERT ON subscription_users
        FOR EACH ROW
        BEGIN
            UPDATE subscription_users
            SET expiry_time = ${ENV === "PROD" ? "DATE_ADD(NEW.insert_time, INTERVAL 30 DAY)" : "DATETIME(NEW.insert_time, '+30 days')"}
            WHERE id = NEW.id;
        END;
    `);
    log(LogTypes.INFO, "Subscription Expiry trigger created or already exists");

    // Update api key usage subscription trigger
    await pool.query(`
        CREATE TRIGGER IF NOT EXISTS update_api_key_usage_subscription
        AFTER INSERT ON subscription_users
        FOR EACH ROW
        BEGIN
            UPDATE api_key_usage
            SET subscription_type_id = NEW.subscription_id
            WHERE user_id = NEW.user_id;
        END;
    `);
    log(LogTypes.INFO, "Update api key usage subscription trigger created or already exists");

    // Subscription types insert
    await pool.query(`
        INSERT INTO subscription_types (id, subscription_name, subscription_price, subscription_price_currency, api_request_limit, api_key_limit, description, function_description)
        VALUES 
            (1, 'Free', 0, 'USD', 1000, 1, 'Basic subscription', 'Manages basic user access'),
            (2, 'Plus', 10, 'USD', 1000000, 5, 'Premium subscription', 'Provides premium features'),
            (3, 'Pro', 25, 'USD', -1, 10, 'Enterprise subscription', 'Enterprise-level access and controls')
        ${ENV === "PROD" ? "ON DUPLICATE KEY UPDATE" : "ON CONFLICT(id) DO UPDATE SET"}
            subscription_name = ${ENV === "PROD" ? "VALUES(subscription_name)" : "excluded.subscription_name"},
            subscription_price = ${ENV === "PROD" ? "VALUES(subscription_price)" : "excluded.subscription_price"},
            subscription_price_currency = ${ENV === "PROD" ? "VALUES(subscription_price_currency)" : "excluded.subscription_price_currency"},
            api_request_limit = ${ENV === "PROD" ? "VALUES(api_request_limit)" : "excluded.api_request_limit"},
            api_key_limit = ${ENV === "PROD" ? "VALUES(api_key_limit)" : "excluded.api_key_limit"},
            description = ${ENV === "PROD" ? "VALUES(description)" : "excluded.description"},
            function_description = ${ENV === "PROD" ? "VALUES(function_description)" : "excluded.function_description"};
    `);
    log(LogTypes.INFO, "Subscription Types created or already exists");

    if (ENV === "PROD") {
        await pool.end();
    }
}

await setupDatabase().catch((err) => {
    log(LogTypes.ERROR, `Setup Database Failed: ${ err }`);
    process.exit(1);
});

log(LogTypes.INFO, "Database setup finished");