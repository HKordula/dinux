CREATE DATABASE IF NOT EXISTS dinux;
USE dinux;

CREATE TABLE IF NOT EXISTS eras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS categories  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS diets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS dinosaurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species_id INT,
    description TEXT,
    era_id INT,
    diet_id INT,
    size VARCHAR(50),
    weight VARCHAR(50),
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
    FOREIGN KEY (diet_id) REFERENCES diets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dinosaur_categories (
    dinosaur_id INT,
    group_id INT,
    PRIMARY KEY (dinosaur_id, group_id),
    FOREIGN KEY (dinosaur_id) REFERENCES dinosaurs(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('activated', 'blocked') DEFAULT 'activated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    dinosaur_id INT,
    PRIMARY KEY (user_id, dinosaur_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dinosaur_id) REFERENCES dinosaurs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS environments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS dinosaur_environments (
    dinosaur_id INT,
    environment_id INT,
    PRIMARY KEY (dinosaur_id, environment_id),
    FOREIGN KEY (dinosaur_id) REFERENCES dinosaurs(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS vote_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    choice1_id INT NOT NULL,
    choice2_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (choice1_id) REFERENCES dinosaurs(id) ON DELETE CASCADE,
    FOREIGN KEY (choice2_id) REFERENCES dinosaurs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vote_session_id INT,
    dinosaur_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vote_session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (dinosaur_id) REFERENCES dinosaurs(id) ON DELETE CASCADE,
    UNIQUE (user_id, vote_session_id)
);
