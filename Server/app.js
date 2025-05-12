const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const env = require('dotenv');
const path = require('path');

env.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// MySQL Connection
let db;

(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();


// Route for Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home', 'index.html'));
});

// Route for Course page
app.get('/kurs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Course', 'index.html'));
});

// Route for Employees page
app.get('/ansatt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Employees', 'index.html'));
});

// Route for Question page
app.get('/sp%C3%B8rsm%C3%A5l', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Question', 'index.html'));
});


// Route for SignIn page
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login1', 'index.html'));
});


// Route for CreateUser page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login1', 'index.html'));
});



const  submit_form = async (req, res) => {
    const { name, topic, message } = req.body;

    console.log('Received login payload:', { name, topic, message });

    res.redirect('/sp%C3%B8rsm%C3%A5l');
};

app.post('/submit_form', submit_form);



const login_auth = async (req, res) => {
    const { username, password } = req.body;
  
    console.log('Received login payload:', { username, password });
  
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
  
      console.log('Query result:', rows);
  
      if (rows.length > 0) {
        // Login successful
        res.redirect('/ansatt?login=Successful');
      } else {
        // Login failed 
        res.redirect('/login?login=Invalid+credentials');
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Internal server error');
    }
  };
  
  
  app.post('/login_auth', login_auth);


// Start server
app.listen(port, () => {
    console.clear()
    console.log(`Server running on http://localhost:${port}`);
});
