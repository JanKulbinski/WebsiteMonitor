DROP DATABASE if exists websiteMonitor;
CREATE DATABASE websiteMonitor;
USE websiteMonitor;

CREATE TABLE users
(
  mail            VARCHAR(255) NOT NULL,
  name            VARCHAR(150) NOT NULL,                
  surname         VARCHAR(150) NOT NULL,
  salt            VARBINARY(32) NOT NULL,                 
  password        VARBINARY(128) NOT NULL,            
  PRIMARY KEY     (mail)                                 
);

INSERT INTO users (name, surname, mail, salt, password)
VALUES ('Jan', 'Kowalski', 'jan.kowalski@we.pl', 'nR4SWlPtW1HdHL6BKQSDcckbVkjmaokt', 'eEZJxcFsyR5WLnVa8LqHLpKPllJR8v10');

CREATE TABLE monitors
(
  id               	  VARCHAR(32) NOT NULL,
  url              	  VARCHAR(255) NOT NULL,               
  choosenElements  	  VARCHAR(150),
  keyWords 		   	  VARCHAR(255),
  intervalMinutes  	  SMALLINT unsigned NOT NULL,
  start 		   	  DATETIME NOT NULL,
  end 			   	  DATETIME NOT NULL,
  textChange    	  BOOLEAN default FALSE,                 
  allFilesChange 	  BOOLEAN default FALSE,
  author 			  VARCHAR(255) NOT NULL,
  active 			  BOOLEAN default true,
  FOREIGN KEY (author)
        REFERENCES users(mail)
        ON DELETE CASCADE,
  PRIMARY KEY     (id)  
);

INSERT INTO monitors (id, url, intervalMinutes, start, end, author)
VALUES ('test123', 'www.lfc.pl', '60', '2020-06-18 10:34:09', '2020-06-19 12:35:09', 'jan.kowalski@we.pl');

CREATE TABLE scans
(
  id               INT unsigned NOT NULL,
  monitorId        VARCHAR(32) NOT NULL,
  isDiffrence 	   BOOLEAN default FALSE,
  FOREIGN KEY 	   (monitorId)
	REFERENCES     monitors(id)
    ON DELETE CASCADE,
  PRIMARY KEY 		(id, monitorId)  
);

CREATE TABLE files
(
  scanId            INT unsigned NOT NULL,
  monitorId         VARCHAR(32) NOT NULL,
  fileHash          VARBINARY(32) NOT NULL,                 
  fileName			VARCHAR(255) NOT NULL,	
  FOREIGN KEY 	    (scanId, monitorId)
	REFERENCES      scans(id, monitorId)
    ON DELETE CASCADE,
  PRIMARY KEY 		(scanId, monitorId, fileName)  
);

SHOW TABLES;
