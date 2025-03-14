-- Subscription types table
CREATE TABLE IF NOT EXISTS subscription_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_name VARCHAR(50) NOT NULL,
    subscription_price INTEGER NOT NULL,
    subscription_price_currency VARCHAR(50) NOT NULL,
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
    timeAndDate TEXT DEFAULT (CURRENT_TIMESTAMP)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    verify BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL
);

-- Subscription users table
CREATE TABLE IF NOT EXISTS subscription_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER,
    user_id INTEGER,
    insert_time TEXT DEFAULT CURRENT_TIMESTAMP,
    expiry_time TEXT DEFAULT (DATETIME('now', '+30 days')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- API key table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name VARCHAR(50) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (api_key)
);

-- API key usage table
CREATE TABLE IF NOT EXISTS api_key_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_usage INTEGER NOT NULL,
    user_id INTEGER,
    subscription_type_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- Insert api key usage on new user trigger
CREATE TRIGGER IF NOT EXISTS insert_api_key_usage_on_new_user
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT OR IGNORE INTO api_key_usage (user_id, subscription_type_id, key_usage)
    VALUES (NEW.id, 1, 0);
END;

-- Subscription users expiry time trigger
CREATE TRIGGER IF NOT EXISTS set_expiry_time
AFTER INSERT ON subscription_users
FOR EACH ROW
BEGIN
    UPDATE subscription_users
    SET expiry_time = DATETIME(NEW.insert_time, '+30 days')
    WHERE id = NEW.id;
END;

-- Update api key usage subscription trigger
CREATE TRIGGER IF NOT EXISTS update_api_key_usage_subscription
AFTER INSERT ON subscription_users
FOR EACH ROW
BEGIN
    UPDATE api_key_usage
    SET subscription_type_id = NEW.subscription_id
    WHERE user_id = NEW.user_id;
END;

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