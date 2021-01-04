CREATE DATABASE i_mask_db;
USE i_mask_db;

CREATE TABLE IF NOT EXISTS users (
	`usrid` INT NOT NULL AUTO_INCREMENT,
    `email` varchar(100) NOT NULL,
    `name` varchar(100) NOT NULL,
    `user_profile` varchar(5) NOT NULL DEFAULT 'user',
    PRIMARY KEY(usrid)
);

CREATE TABLE IF NOT EXISTS PersonalUsers (
	`id` INT NOT NULL AUTO_INCREMENT,
    `ext_usrid` INT NOT NULL,
    `psw` varchar(100) NOT NULL,
    `salt` varchar(500) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (ext_usrid)
        REFERENCES users (usrid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS UsersFacebook (
	`id` INT NOT NULL AUTO_INCREMENT,
    `ext_usrid` INT NOT NULL,
    `idFacebook` varchar(100) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(ext_usrid)
        REFERENCES users(usrid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS UsersGoogle(
	`id` INT NOT NULL AUTO_INCREMENT,
    `ext_usrid` INT NOT NULL,
    `idGoogle` varchar(100) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(ext_usrid)
        REFERENCES users(usrid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE maskdata (
	id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(300) NOT NULL,
    shop VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    reusable VARCHAR(100) NOT NULL,
    expiration VARCHAR(100) NOT NULL,
    price DOUBLE NOT NULL,
    effectiveness VARCHAR(100) NOT NULL,
    durability VARCHAR(100) NOT NULL,
    link VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);