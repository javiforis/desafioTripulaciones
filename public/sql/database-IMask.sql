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
    name VARCHAR(900),
    shop VARCHAR(900),
    type VARCHAR(200),
    type2 VARCHAR(600),
    reusable INT(11),
    price DECIMAL(10,3),
    certificate VARCHAR(255),
    effectiveness VARCHAR(300),
    expiration TIME,
    respiratory INT(11),
    children INT(11),
    sport INT(11),
    PRIMARY KEY (id)
);