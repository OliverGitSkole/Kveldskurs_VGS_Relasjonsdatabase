const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

class dbService {
    constructor() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        this.connection.connect((err) => {
            if (err) {
                console.error('Database connection error:', err.message);
            } else {
                console.log('Database connected successfully');
            }
        });
    }

    static getInstance() {
        if (!dbService.instance) {
            dbService.instance = new dbService();
        }
        return dbService.instance;
    }

    initiateQuery(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = dbService;
