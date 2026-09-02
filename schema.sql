CREATE DATABASE IF NOT EXISTS kimutai_analytics;
USE kimutai_analytics;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status ENUM('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_id INT NULL,
    provider VARCHAR(50) NULL,
    provider_reference VARCHAR(255) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'KES',
    status ENUM('pending', 'confirmed', 'failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    index_name ENUM('Boom 500', 'Boom 300', 'Crash 500', 'Crash 300') NOT NULL,
    ema_alignment ENUM('Valid', 'Invalid') NOT NULL,
    rsi_level DECIMAL(5, 2) NOT NULL,
    exit_type ENUM('Spike Hit', '5-Candle Cut', 'Hard Stop') NOT NULL,
    pnl_amount DECIMAL(6, 2) NOT NULL,
    notes TEXT NULL
);

CREATE TABLE IF NOT EXISTS signals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    index_name ENUM('Boom 500', 'Boom 300', 'Crash 500', 'Crash 300') NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    ema_alignment ENUM('Valid', 'Invalid') NOT NULL,
    rsi_level DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
