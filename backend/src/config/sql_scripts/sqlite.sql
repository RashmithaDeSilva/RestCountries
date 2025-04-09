-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contact_number TEXT,
    roll TEXT CHECK(roll IN ('SUPER_ADMIN', 'ADMIN')) NOT NULL,
    password_hash TEXT NOT NULL
);

-- Subscription types table
CREATE TABLE IF NOT EXISTS subscription_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_name TEXT NOT NULL,
    subscription_price INTEGER NOT NULL,
    subscription_price_currency TEXT NOT NULL,
    api_request_limit INTEGER NOT NULL,
    api_key_limit INTEGER NOT NULL,
    description TEXT,
    function_description TEXT
);

-- Error log table
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    message TEXT NOT NULL,
    stack TEXT NOT NULL,
    request_data TEXT NOT NULL,
    timeAndDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contact_number TEXT,
    verify BOOLEAN DEFAULT FALSE,
    password_hash TEXT NOT NULL
);

-- Subscription users table
CREATE TABLE IF NOT EXISTS subscription_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER DEFAULT 1, -- Default to free plan
    user_id INTEGER NOT NULL,
    insert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP DEFAULT (DATETIME('now', '+30 days')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- API key table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API key usage table
CREATE TABLE IF NOT EXISTS api_key_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_usage INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    subscription_type_id INTEGER NOT NULL DEFAULT 1,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- Reset free user API usage on the 1st of every month
CREATE TRIGGER IF NOT EXISTS reset_free_users_usage
AFTER INSERT ON api_key_usage
BEGIN
    UPDATE api_key_usage
    SET key_usage = 0, last_reset = CURRENT_TIMESTAMP
    WHERE subscription_type_id = 1 AND strftime('%d', CURRENT_TIMESTAMP) = '01';
END;

-- Check expired subscriptions daily and reset to free plan
CREATE TRIGGER IF NOT EXISTS check_expired_subscriptions
AFTER UPDATE ON subscription_users
BEGIN
    UPDATE subscription_users
    SET subscription_id = 1, expiry_time = DATETIME('now', '+30 days')
    WHERE expiry_time <= CURRENT_TIMESTAMP;
    
    UPDATE api_key_usage
    SET subscription_type_id = 1, key_usage = 0, last_reset = CURRENT_TIMESTAMP
    WHERE user_id IN (SELECT user_id FROM subscription_users WHERE subscription_id = 1);
    
    DELETE FROM api_keys
    WHERE user_id IN (SELECT user_id FROM subscription_users WHERE subscription_id = 1)
    AND id NOT IN (
        SELECT MIN(id) FROM api_keys GROUP BY user_id
    );
END;

-- Insert API key usage for new users
CREATE TRIGGER IF NOT EXISTS insert_api_key_usage_on_new_user
AFTER INSERT ON users
BEGIN
    INSERT INTO api_key_usage (user_id, subscription_type_id, key_usage)
    VALUES (NEW.id, 1, 0);
    
    INSERT INTO subscription_users (user_id, subscription_id, insert_time, expiry_time)
    VALUES (NEW.id, 1, CURRENT_TIMESTAMP, DATETIME('now', '+30 days'));
END;

-- Update API key usage on subscription change
CREATE TRIGGER IF NOT EXISTS update_api_key_usage_subscription
AFTER INSERT ON subscription_users
BEGIN
    UPDATE api_key_usage
    SET subscription_type_id = NEW.subscription_id
    WHERE user_id = NEW.user_id;
END;

-- Insert super admin
-- INSERT INTO admins (id, first_name, surname, email, contact_number, roll, password_hash)
-- VALUES 
--     (1, 'Super', 'Admin', 'admin@example.com', '+94761234567', 'SUPER_ADMIN', 
--     '$argon2id$v=19$m=65536,t=3,p=1$4Z0ePixF6hbnfppLSoqlYw$5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntCg') -- password12345
-- ON CONFLICT(id) DO UPDATE SET 
--     first_name = excluded.first_name,
--     surname = excluded.surname,
--     email = excluded.email,
--     contact_number = excluded.contact_number,
--     roll = excluded.roll,
--     password_hash = excluded.password_hash;

-- Insert initial subscription types
INSERT INTO subscription_types (id, subscription_name, subscription_price, subscription_price_currency, api_request_limit, api_key_limit, description, function_description)
VALUES 
    (1, 'Free', 0, 'USD', 1000, 1, 'Basic subscription', 'Manages basic user access'),
    (2, 'Plus', 10, 'USD', 1000000, 5, 'Premium subscription', 'Provides premium features'),
    (3, 'Pro', 25, 'USD', -1, 10, 'Enterprise subscription', 'Enterprise-level access and controls')
ON CONFLICT(id) DO UPDATE SET
    subscription_name = excluded.subscription_name,
    subscription_price = excluded.subscription_price,
    subscription_price_currency = excluded.subscription_price_currency,
    api_request_limit = excluded.api_request_limit,
    api_key_limit = excluded.api_key_limit,
    description = excluded.description,
    function_description = excluded.function_description;
