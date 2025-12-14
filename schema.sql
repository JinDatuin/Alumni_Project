-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS user_answers;
DROP TABLE IF EXISTS job_history;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- Create users table for alumni accounts
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Create questions table for the survey
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text VARCHAR(255) NOT NULL
);

-- Insert survey questions
INSERT INTO questions (question_text) VALUES
('What is your current employment status?'),
('What is your current job title?'),
('How relevant was your program of study to your current job?'),
('What skills that you learned are most valuable in your current role?'),
('Would you recommend your program of study to others?');

-- Create user_answers table to store alumni answers
CREATE TABLE user_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create job_history table to store alumni job experiences
CREATE TABLE job_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
