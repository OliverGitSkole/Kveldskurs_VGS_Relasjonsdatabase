### KveldsKurs
##### En nettside som bruker relasjonsdatabaser
For å ha et sted hvor lærere og kontoransatte kan sette opp kurs,gi karakterer, melde in fravær, og sende in spørsmål, er det satt opp brukere for ansatt lærer og administatorere, slik at oppgavene kan gjøres

---

### Node
Nettsiden bruker node med express og ande pakker for å kjøre
##### Pakker:
	`js`
    const express = require('express');
    const mysql = require('mysql2/promise');
    const cors = require('cors');
    const env = require('dotenv');
    const path = require('path');
    const cookieParser = require('cookie-parser');
    const { permission } = require('process');
###### Du kan installere disse med:
    `node`
    npm install express mysql2 cors dotenv path cookie-parser

---

### Bruker Datalagring
Brukernavn og avgang nivå lagres på en sql tabell så det er lett tillenlig

##### Passord
Ettersom at dette er en simplifisert verson av hva en skole kunne hatt er det ikke brukt noen form for [Hashing](https://supertokens.com/blog/password-hashing-salting#:~:text=Password%20hashing%20is%20a%20multi,they%20provide%20a%20plaintext%20password.). det er mer fokus på funksjon og bruker venlighet.

---

### SQL Relasjonsdatabase

Databasen er laget for å være en relasjonsdatabase, slik at man slipper unna  store og lange tabeller, og for mere funksjonalitet

#### MySQL Community Server & MySQL WorkBench
Denne nettsiden er lagd slik at det skal virke med andre database systemer men det er ikke testet, det som er blitt brukt er MySQL Community Server Med MySQL WorkBench

#### Tabellene Brukt:

###### User
| UserID | Username | Password | Cookie | Premission |
| --- | --- | --- | --- | --- |
| INT | varchar(20) | varchar(20) | varchar(100) | INT |

###### Ansatt

| AnsattID | UserID | Fornavn | Etternavn | Rolle |
| --- | --- | --- | --- | --- |
| INT | INT | varchar(65) | varchar(65) | INT |

###### Elev

| ElevID | Fornavn | Etternavn | ForesattMobil |
| --- | --- | --- | --- |
| INT | varchar(25) | varchar(25) | INT |

###### Kurs

| KursID | AnsattID | Fag |
| --- | --- | --- |
| INT | INT | INT |

###### Deltat

| DeltatID | KursID | ElevID | TotalTimer |
| --- | --- | --- | --- |
| INT | INT | INT | INT |

###### Karakterer

| KarakterID | ElevID | KursID | P1 | P2 | P3 | SP |
| --- | --- | --- | --- | --- | --- | --- |
| INT | INT | INT | INT | INT | INT | INT |

#### SQL Tabell Query:

    `SQL`

    -- Create the database
    CREATE DATABASE YourDatabaseName;
    USE YourDatabaseName;

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

#### SQL Admin User Query
For å kunne utnytte funksjoner på nettsiden burde vi opprette en admin bruker, det kan gjøres slikt.
Da blir admin passord og brukernavn slikt:
###### Brukernavn: admin1
###### Passord: admin1

    `SQL`
    
    -- Insert Admin Info Into User Table
    INSERT INTO users (username, password, cookie, permission)
    VALUES ('admin1', 'admin1', '6076', '6');

    --Insert Admin Info Into ansatt Table
    INSERT INTO ansatt (UserID, fornavn, etternavn)
    VALUES ('6', 'admin1', 'admin1');

---


