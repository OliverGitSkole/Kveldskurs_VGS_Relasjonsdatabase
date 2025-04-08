const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const env = require('dotenv');

env.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Routes
app.get('/', (req, res) => {
    res.send('Node.js, Express, MySQL, and CORS API');
});

// Get all records
app.get('/getAll', (req, res) => {
    db.query('SELECT * FROM people;', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
        console.log(results);
    });
});

app.get('/test1', (req, res) => {
    console.log('test 1');
    res.send('Test 1 endpoint');
  });


// Create a record
app.post('/itemsm', (req, res) => {
    const { name, description } = req.body;
    db.query('INSERT INTO people (name, description) VALUES (?, ?)', [name, description], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, name, description });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
