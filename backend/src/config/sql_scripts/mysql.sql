-- Create database
CREATE DATABASE IF NOT EXISTS cw1;

-- Use database that create
USE cw1;

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    roll ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Subscription types table
CREATE TABLE IF NOT EXISTS subscription_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_name VARCHAR(50) NOT NULL,
    subscription_price INT NOT NULL,
    subscription_price_currency VARCHAR(50) NOT NULL,
    api_request_limit INT NOT NULL,
    api_key_limit INT NOT NULL,
    description TEXT,
    function_description TEXT
);

-- Error log table
CREATE TABLE IF NOT EXISTS error_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location TEXT NOT NULL,
    message TEXT NOT NULL,
    stack TEXT NOT NULL,
    request_data TEXT NOT NULL,
    timeAndDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    verify BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL
);

-- Subscription users table
CREATE TABLE IF NOT EXISTS subscription_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT DEFAULT 1, -- Default to free plan
    user_id INT NOT NULL,
    insert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP DEFAULT (DATE_ADD(NOW(), INTERVAL 30 DAY)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- API key table
CREATE TABLE IF NOT EXISTS api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(50) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (api_key)
);

-- API key usage table
CREATE TABLE IF NOT EXISTS api_key_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_usage INT NOT NULL DEFAULT 0,
    user_id INT NOT NULL,
    subscription_type_id INT NOT NULL DEFAULT 1,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id) ON DELETE CASCADE
);

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Reset free user API usage on the 1st of every month
CREATE EVENT IF NOT EXISTS reset_free_users_usage
ON SCHEDULE EVERY 1 MONTH STARTS TIMESTAMP(CONCAT(YEAR(NOW()), '-', MONTH(NOW()), '-01 00:00:00'))
DO
BEGIN
    UPDATE api_key_usage
    SET key_usage = 0, last_reset = NOW()
    WHERE subscription_type_id = 1;
END;

-- Check expired subscriptions daily and reset to free plan
CREATE EVENT IF NOT EXISTS check_expired_subscriptions
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    UPDATE subscription_users
    SET subscription_id = 1, expiry_time = DATE_ADD(NOW(), INTERVAL 30 DAY)
    WHERE expiry_time <= NOW();
    
    UPDATE api_key_usage
    SET subscription_type_id = 1, key_usage = 0, last_reset = NOW()
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
FOR EACH ROW
BEGIN
    INSERT INTO api_key_usage (user_id, subscription_type_id, key_usage)
    VALUES (NEW.id, 1, 0);
    
    INSERT INTO subscription_users (user_id, subscription_id, insert_time, expiry_time)
    VALUES (NEW.id, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
END;

-- Update API key usage on subscription change
CREATE TRIGGER IF NOT EXISTS update_api_key_usage_subscription
AFTER INSERT ON subscription_users
FOR EACH ROW
BEGIN
    UPDATE api_key_usage
    SET subscription_type_id = NEW.subscription_id
    WHERE user_id = NEW.user_id;
END;

-- Insert super admin
-- INSERT INTO admins (id, first_name, surname, email, contact_number, roll, password_hash)
-- VALUES 
--     (1, 'Super', 'Admin', 'admin@gmail.com', '+94761234567', 'SUPER_ADMIN', 
--     '$argon2id$v=19$m=65536,t=3,p=1$4Z0ePixF6hbnfppLSoqlYw$5iLt1QIXlARhJc2mSwXB5yETHH+ZsKslfB03XJpntCg') -- password12345
-- ON DUPLICATE KEY UPDATE
--     first_name = VALUES(first_name),
--     surname = VALUES(surname),
--     email = VALUES(email),
--     contact_number = VALUES(contact_number),
--     roll = VALUES(roll),
--     password_hash = VALUES(password_hash);

-- Insert initial subscription types
INSERT INTO subscription_types (id, subscription_name, subscription_price, subscription_price_currency, api_request_limit, api_key_limit, description, function_description)
VALUES 
    (1, 'Free', 0, 'USD', 1000, 1, 'Basic subscription', 'Manages basic user access'),
    (2, 'Plus', 10, 'USD', 1000000, 5, 'Premium subscription', 'Provides premium features'),
    (3, 'Pro', 25, 'USD', -1, 10, 'Enterprise subscription', 'Enterprise-level access and controls')
ON DUPLICATE KEY UPDATE
    subscription_name = VALUES(subscription_name),
    subscription_price = VALUES(subscription_price),
    subscription_price_currency = VALUES(subscription_price_currency),
    api_request_limit = VALUES(api_request_limit),
    api_key_limit = VALUES(api_key_limit),
    description = VALUES(description),
    function_description = VALUES(function_description);
