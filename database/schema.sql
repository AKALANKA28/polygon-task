CREATE DATABASE IF NOT EXISTS polygon_tasks;
USE polygon_tasks;

CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  avatar_url  VARCHAR(500) DEFAULT NULL,
  department  VARCHAR(100) DEFAULT NULL,
  phone       VARCHAR(20) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  status       ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority     ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_to  INT,
  created_by   INT NOT NULL,
  due_date     DATE DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Seed users (password: password123)
-- bcrypt hash of 'password123': $2b$10$8K4X0WGqJNuVHQCQpHbWe.Pw0aGfR6Z0d8eN5ZYpJKNMuqN8MfJHi
INSERT INTO users (name, email, password, role, department) VALUES
('Admin User', 'admin@polygon.com', '$2b$10$8K4X0WGqJNuVHQCQpHbWe.Pw0aGfR6Z0d8eN5ZYpJKNMuqN8MfJHi', 'admin', 'Management'),
('Jane Smith', 'jane@polygon.com', '$2b$10$8K4X0WGqJNuVHQCQpHbWe.Pw0aGfR6Z0d8eN5ZYpJKNMuqN8MfJHi', 'employee', 'Engineering'),
('John Doe', 'john@polygon.com', '$2b$10$8K4X0WGqJNuVHQCQpHbWe.Pw0aGfR6Z0d8eN5ZYpJKNMuqN8MfJHi', 'employee', 'Design');

-- Seed tasks
INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES
('Setup CI/CD Pipeline', 'Configure GitHub Actions for automated testing and deployment', 'in_progress', 'high', 2, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
('Design Landing Page', 'Create mockups for the new marketing website', 'pending', 'medium', 3, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Fix Authentication Bug', 'Users are getting logged out after 5 minutes', 'completed', 'high', 2, 1, DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
('Write API Documentation', 'Document all REST endpoints with examples', 'pending', 'low', 2, 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('Implement Dark Mode', 'Add dark mode support across the entire app', 'in_progress', 'medium', 3, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('Database Optimization', 'Add indexes and optimize slow queries', 'pending', 'high', 2, 1, CURDATE()),
('User Onboarding Flow', 'Create a guided onboarding experience for new users', 'pending', 'medium', 3, 1, DATE_ADD(CURDATE(), INTERVAL 10 DAY));
