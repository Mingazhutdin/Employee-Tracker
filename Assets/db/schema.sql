-- Active: 1664495643342@@127.0.0.1@3306@challenge_db
DROP DATABASE if EXISTS challenge_db;

CREATE DATABASE challenge_db;

USE challenge_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
);

CREATE TABLE employee (
id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id  INT NOT NULL,
manager_id INT,
FOREIGN key (manager_id)
REFERENCES employee(id),
FOREIGN key (role_id)
REFERENCES role(id)
);

-- drop table employee;