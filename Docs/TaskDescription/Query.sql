-- Create the database
CREATE DATABASE KveldsKurs;
USE KveldsKurs;

-- Table: users
CREATE TABLE users (
  UserID INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  cookie VARCHAR(100),
  permission INT NOT NULL,
  PRIMARY KEY (UserID),
  UNIQUE KEY username (username)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: ansatt (employee)
CREATE TABLE ansatt (
  AnsattID INT NOT NULL AUTO_INCREMENT,
  UserID INT,
  Fornavn VARCHAR(65) NOT NULL,
  Etternavn VARCHAR(65) NOT NULL,
  PRIMARY KEY (AnsattID),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: elev (student)
CREATE TABLE elev (
  ElevID INT NOT NULL AUTO_INCREMENT,
  Fornavn VARCHAR(25),
  Etternavn VARCHAR(25),
  ForresattMobil VARCHAR(15),
  PRIMARY KEY (ElevID)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: kurs (course)
CREATE TABLE kurs (
  KursID INT NOT NULL AUTO_INCREMENT,
  AnsattID INT,
  Fag INT,
  PRIMARY KEY (KursID),
  FOREIGN KEY (AnsattID) REFERENCES ansatt(AnsattID)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: deltat (participation)
CREATE TABLE deltat (
  DeltaID INT AUTO_INCREMENT,
  KursID INT,
  ElevID INT,
  AntallTimer INT,
  PRIMARY KEY (DeltaID),
  FOREIGN KEY (KursID) REFERENCES kurs(KursID),
  FOREIGN KEY (ElevID) REFERENCES elev(ElevID)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: karakterer (grades)
CREATE TABLE karakterer (
  KarakterID INT NOT NULL AUTO_INCREMENT,
  ElevID INT,
  KursID INT,
  P1 INT,
  P2 INT,
  P3 INT,
  SP INT,
  PRIMARY KEY (KarakterID),
  FOREIGN KEY (ElevID) REFERENCES elev(ElevID),
  FOREIGN KEY (KursID) REFERENCES kurs(KursID)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO users (username, password, cookie, permission)
VALUES ('admin1', 'admin1', '6076', '6');


INSERT INTO ansatt (UserID, fornavn, etternavn)
VALUES ('6', 'admin1', 'admin1');