CREATE DATABASE IF NOT EXISTS 'dinux';

CREATE TABLE IF NOT EXISTS 'dinosaur' (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255),
    description TEXT,
    era_id INT,
    diet VARCHAR(50),
    size VARCHAR(50),
    image_url VARCHAR(255),
    FOREIGN KEY (era_id) REFERENCES Eras(id)
);

CREATE TABLE IF NOT EXISTS 'Eras' (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS 'vote'(
    id INT AUTO_INCREMENT PRIMARY KEY,
    dinosaur_id INT,
    vote TINYINT,
    FOREIGN KEY (dinosaur_id) REFERENCES dinosaur(id)
)

CREATE TABLE IF NOT EXISTS 'user'(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    permission_level INT
)

CREATE TABLE IF NOT EXISTS 'environment'(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
)

