const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const env = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const { permission } = require('process');
const app = express();
const port = process.env.PORT || 3000;
env.config(); 



// app.use
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


// MySQL Session
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



// Functions

const createUser = async (req, res) => {
  const { username, password, permissionlvl, fornavn, etternavn } = req.body;

  console.log('Received signup payload:', { username, password, permissionlvl, fornavn, etternavn });

  try {
    // Step 1: Insert new user
    const [insertResult] = await db.execute(
      'INSERT INTO users (username, password, cookie, permission) VALUES (?, ?, 001, ?)',
      [username, password, permissionlvl]
    );

    const userId = insertResult.insertId;

    // Step 2: Calculate cookie value
    const cookieValue = userId * 1000 + 70 + permissionlvl;
  
    // Step 3: Store cookie in the database
    await db.execute(
      'UPDATE users SET cookie = ? WHERE UserID = ?',
      [cookieValue, userId]
    );
    
    await db.execute(
      'INSERT INTO ansatt (UserID, Fornavn, Etternavn) VALUES (?, ?, ?)',
      [userId, fornavn, etternavn]
    );

    // Step 4: Redirect or respond
    res.redirect('/login?signup=success');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Failed to create user');
  }
};

const isdev = async (req,res, next) => {
  const cookie = req.cookies.user_session;

    if (!cookie) {
        console.log('cookie not found')
        return res.redirect('/Error404');
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE cookie = ?', [6076]);

        if (rows.length > 0) {
            // Cookie matches, proceed to the next middleware (sending the page)
            console.log('Cookie auth sucsess')
            return next();
        } else {
            // Invalid cookie, redirect to Error404
            res.redirect('/Error404');
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
};

const  submit_form = async (req, res) => {
  const { name, topic, message } = req.body;

  console.log('Received login payload:', { name, topic, message });

  res.redirect('/sp%C3%B8rsm%C3%A5l');
};

const CookieAuth = async (req, res, next) => {
  const cookie = req.cookies.user_session;

  if (!cookie) {
      console.log('cookie not found')
      return res.redirect('/login');
  }

  try {
      const [rows] = await db.execute('SELECT * FROM users WHERE cookie = ?', [cookie]);

      if (rows.length > 0) {
          // Cookie matches, proceed to the next middleware (sending the page)
          console.log('Cookie auth sucsess')
          return next();
      } else {
          // Invalid cookie, redirect to login
          res.redirect('/login');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Internal server error');
  }
};

const login_auth = async (req, res) => {
  const { username, password } = req.body;

  console.log('Received login payload:', { username, password });

  try {
      const [rows] = await db.execute(
          'SELECT UserID, permission FROM users WHERE username = ? AND password = ?',
          [username, password]
      );

      console.log('Query result:', rows);

      if (rows.length > 0) {
          const user = rows[0];
          const userId = user.UserID;
          const permissionLevel = user.permission;

          const cookieValue = userId * 1000 + 70 + permissionLevel;
          console.log(cookieValue);

          res.cookie('user_session', cookieValue, {
              httpOnly: true,
              secure: true,
              maxAge: 3600000
          });

          res.redirect('/ansatt');
      } else {
          res.redirect('/login?login=Invalid+credentials');
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Internal server error');
  }
};

const ansatt_role = async (req, res) => {
  const cookie = req.cookies.user_session;
  console.log(cookie);

  if (!cookie) {
    console.log('cookie not found');
    return res.redirect('/login');
  } else {
    const str = String(cookie);
    const permission = parseInt(str[str.length - 1]);

    if (permission === 6) {
      return res.redirect('/ansatt/admin')

    } else if (permission === 3) {
      return res.redirect('/ansatt/kontor')

    } else if (permission === 2) {
      return res.redirect('/ansatt/lærer')

    } else if (permission === 1) {
      return res.redirect('/?GuestPage=FALSE')

    } else {
      console.log('Unknown or unauthorized permission level:', permission);
      // Handle unknown permission
      return res.redirect('/Error404?PageAccess=DENIED');
    }
  }
};

const ansatt_lærer = async (req, res, next) => {
  const cookie = req.cookies.user_session;
  console.log(cookie);

  if (!cookie) {
    console.log('cookie not found');
    return res.redirect('/login');
  } else {
    const str = String(cookie);
    const permission = parseInt(str[str.length - 1]);

    if (permission === 1) {
      return res.redirect('/?GuestPage=FALSE')

    } else if (permission === 2 || permission === 6) {
      next()

    } else {
      console.log('Unknown or unauthorized permission level:', permission);
      // Handle unknown permission
      return res.redirect('/Error404?PageAccess=DENIED');
    }
  }
};

const ansatt_kontor = async (req, res, next) => {
  const cookie = req.cookies.user_session;
  console.log(cookie);

  if (!cookie) {
    console.log('cookie not found');
    return res.redirect('/login');
  } else {
    const str = String(cookie);
    const permission = parseInt(str[str.length - 1]);

    if (permission === 1) {
      return res.redirect('/?GuestPage=FALSE')

    } else if (permission === 3 || permission === 6) {
      next()

    } else {
      console.log('Unknown or unauthorized permission level:', permission);
      // Handle unknown permission
      return res.redirect('/Error404?PageAccess=DENIED');
    }
  }
};

const ansatt_admin = async (req, res, next) => {
  const cookie = req.cookies.user_session;
  console.log(cookie);

  if (!cookie) {
    console.log('cookie not found');
    return res.redirect('/login');
  } else {
    const str = String(cookie);
    const permission = parseInt(str[str.length - 1]);

    if (permission === 6) {
      next()
    } 
    
    else {
      console.log('Unknown or unauthorized permission level:', permission);
      // Handle unknown permission
      return res.redirect('/Error404?PageAccess=DENIED');
    }
  }
};

// app.get

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home', 'index.html'));
});

// Kurs
app.get('/kurs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Course', 'index.html'));
});

// Error
app.get('/Error404', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Err4', 'index.html'));
});

// Spørsmål
app.get('/sp%C3%B8rsm%C3%A5l', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Question', 'index.html'));
});

// Lag bruker
app.get('/create', isdev, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Create_new_user1', 'index.html'));
});

// Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login1', 'index.html'));
});

// Ansatt
app.get('/ansatt', ansatt_role);

app.get('/ansatt/kontor', ansatt_kontor, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_kontor', 'index.html'));
});

app.get('/ansatt/l%C3%A6rer', ansatt_lærer, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_lærer', 'index.html'));
});

app.get('/ansatt/admin', ansatt_admin, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_admin', 'index.html'));
});

// app.post

// Spørsmål Form
app.post('/submit_form', submit_form);

// Lage bruker
app.post('/create_user', isdev, createUser);

// test inlogin
app.post('/login_auth', login_auth);



// Start server
app.listen(port, () => {
    console.clear()
    console.log(`Server running on http://localhost:${port}`);
});
