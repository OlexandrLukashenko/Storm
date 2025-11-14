CREATE DATABASE strom_store;
USE strom_store;

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    price INT,
    thumb TEXT,
    description TEXT
);