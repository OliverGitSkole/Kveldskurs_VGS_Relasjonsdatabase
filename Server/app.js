const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService.js'); // importerer dbService
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Instantiate the DB Service
const db = dbService.getInstance();

// Test Query Endpoint
app.get('/getSome', async (request, response) => {
    try {
        const sql = 'SELECT * FROM People';
        const query = await db.initiateQuery(sql, []);
        response.json(query);
        console.log(query);
    } catch (err) {
        console.error('Query Error:', err.message);
        response.status(500).json({ error: 'Database query failed' });
    }
});


// Create

app.get('/getAll', async (request, response) => {
    try {
        const sql = 'SELECT * FROM People';
        const query = await db.initiateQuery(sql, []);
        response.json(query);
        console.log(query);
    } catch (err) {
        console.error('Query Error:', err.message);
        response.status(500).json({ error: 'Database query failed' });
    }
});


// Read


// Update


// Delete



// Start Express Server
app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT));
