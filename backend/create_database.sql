-- Tạo database identity_service
CREATE DATABASE IF NOT EXISTS identity_service;

-- Sử dụng database
USE identity_service;

-- Bảng roles: khóa chính là name (khớp entity Role @Id String name)
CREATE TABLE IF NOT EXISTS roles (
    name VARCHAR(64) PRIMARY KEY,
    description TEXT
);

-- Tạo bảng users (đã được đổi tên từ user)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    create_at DATE,
    role VARCHAR(64),
    FOREIGN KEY (role) REFERENCES roles (name)
);

-- Tạo bảng otp
CREATE TABLE IF NOT EXISTS otp (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tạo bảng permissions
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Tạo bảng role_permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(64),
    permission_id VARCHAR(36),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (name),
    FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

-- Tạo bảng invalidated_tokens
CREATE TABLE IF NOT EXISTS invalidated_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiry_time DATETIME NOT NULL
);

-- Hai role mặc định: USER (người dùng), ADMIN (quản trị) — không dùng CUSTOMER/STAFF
INSERT IGNORE INTO roles (name, description) VALUES
('USER', 'User role'),
('ADMIN', 'Admin role');
