CREATE DATABASE websiteMonitor;
USE websiteMonitor;

CREATE TABLE users
(
  id              INT unsigned NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150) NOT NULL,                
  surname         VARCHAR(150) NOT NULL,                
  mail            VARCHAR(255) NOT NULL,               
  salt            CHAR(32) NOT NULL,                 
  password        CHAR(128) NOT NULL,           
  PRIMARY KEY     (id)                                 
);
SHOW TABLES;
