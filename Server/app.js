// ---------------------------------------------// Requierd Packages // ---------------------------------------------//

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



// ---------------------------------------------// Telling App.js to Use these Packages // ---------------------------------------------//



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



// ---------------------------------------------// Establishing SQL Connection // ---------------------------------------------//



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




// ---------------------------------------------// Main Functions // ---------------------------------------------//




// ---------------- // Create User function // ---------------- //

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


// ---------------- // Create Course Function // ---------------- //

const lag_kurs = async (req, res) => {
  const { Etternavn, Fag } = req.body;

  console.log('Received Lag kurs payload:', { Etternavn, Fag });

  try {
    // Step 1: Get AnsattID from ansatt table
    const [ansattRows] = await db.execute(
      'SELECT AnsattID FROM ansatt WHERE Etternavn = ?',
      [Etternavn]
    );

    if (ansattRows.length === 0) {
      return res.status(404).send('Ansatt not found');
    }

    const ansattID = ansattRows[0].AnsattID;

    // Step 2: Insert into kurs table
    await db.execute(
      'INSERT INTO kurs (AnsattID, Fag) VALUES (?, ?)',
      [ansattID, Fag]
    );

    res.redirect('/ansatt/kontor');
  } catch (error) {
    console.error('Error creating kurs:', error);
    res.status(500).send('Failed to create Kurs');
  }
};


// ---------------- // Delete Course Function // ---------------- //

const slett_kurs = async (req, res) => {
  const { Etternavn, Fag } = req.body;

  console.log('Received Lag kurs payload:', { Etternavn, Fag });

  try {

      const [ansattRows] = await db.execute(
        'SELECT AnsattID FROM ansatt WHERE Etternavn = ?',
        [Etternavn]
      );
  
      if (ansattRows.length === 0) {
        return res.status(404).send('Ansatt not found');
      }

      const AnsattID = ansattRows[0].AnsattID;

    const [kursRows] = await db.execute(
      'SELECT KursID FROM kurs WHERE AnsattID = ? AND Fag = ?',
      [AnsattID, Fag]
    );

    if (kursRows.length === 0) {
      return res.status(404).send('Kurs not found');
    }

    const KursID = kursRows[0].KursID;


    await db.execute(
      'DELETE FROM karakterer WHERE KursID = ?',
      [KursID]
    );
    await db.execute(
      'DELETE FROM deltat WHERE KursID = ?',
      [KursID]
    );
    await db.execute(
      'DELETE FROM kurs WHERE KursID = ?',
      [KursID]
    );

    res.redirect('/ansatt/kontor');
  } catch (error) {
    console.error('Error deleting kurs:', error);
    res.status(500).send('Failed to delete Kurs');
  }
};


// ---------------- // Create Student Function // ---------------- //

const lag_elev = async (req, res) => {
  const { Fornavn, Etternavn, Mobil } = req.body;
  
  console.log('Received Lag kurs payload:', { Fornavn, Etternavn, Mobil });

  try {
    const [insertResult] = await db.execute(
      'INSERT INTO elev (Fornavn, Etternavn, ForresattMobil) VALUES (?, ?, ?)',
      [Fornavn, Etternavn, Mobil]
    );
    
    res.redirect('/ansatt/kontor');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Failed to create elev');
  }
};


// ---------------- // Delete Student Function // ---------------- //

const slett_elev = async (req, res) => {
  const { Fornavn, Mobil } = req.body;
  
  console.log('Received slett elev payload:', { Fornavn, Mobil });

  try {
    const [elevRows] = await db.execute(
      'SELECT ElevID FROM elev WHERE Fornavn = ? AND ForresattMobil = ?',
      [Fornavn, Mobil]
    );

    if (elevRows.length === 0) {
      return res.status(404).send('Elev not found');
    }

    const ElevID = elevRows[0].ElevID;

    await db.execute(
      'DELETE FROM karakterer WHERE ElevID = ?',
      [ElevID]
    );
    await db.execute(
      'DELETE FROM deltat WHERE ElevID = ?',
      [ElevID]
    );
    await db.execute(
      'DELETE FROM elev WHERE ElevID = ?',
      [ElevID]
    );
    
    res.redirect('/ansatt/kontor');
  } catch (error) {
    console.error('Error deleting elev:', error);
    res.status(500).send('Failed to delete elev');
  }
};


// ---------------- // Add Student to Course Function // ---------------- //

const legtil_elev = async (req, res) => {
  const { Fornavn, Mobil, Fag } = req.body;

  console.log('Received Lag kurs payload:', { Fornavn, Fag, Mobil });

  try {
    // 1. Get KursID based on Fag
    const [kursRows] = await db.execute(
      'SELECT KursID FROM kurs WHERE Fag = ?',
      [Fag]
    );

    if (kursRows.length === 0) {
      return res.status(404).send('Kurs not found');
    }

    const KursID = kursRows[0].KursID;

    // 2. Get ElevID based on Fornavn and Mobil
    const [elevRows] = await db.execute(
      'SELECT ElevID FROM elev WHERE Fornavn = ? AND ForresattMobil = ?',
      [Fornavn, Mobil]
    );

    if (elevRows.length === 0) {
      return res.status(404).send('Elev not found');
    }

    const ElevID = elevRows[0].ElevID;

    // 3. Insert into karakterer
    await db.execute(
      'INSERT INTO karakterer (KursID, ElevID, P1, P2, P3, SP) VALUES (?, ?, ?, ?, ?, ?)',
      [KursID, ElevID, 0, 0, 0, 0]
    );

    // 4. Insert into deltat
    await db.execute(
      'INSERT INTO deltat (KursID, ElevID, AntallTimer) VALUES (?, ?, ?)',
      [KursID, ElevID, 0]
    );

    res.redirect('/ansatt/kontor');
  } catch (error) {
    console.error('Error inserting into karakterer or deltat:', error);
    res.status(500).send('Failed to create elev entry');
  }
};


// ---------------- // Check if user is Administrators Function // ---------------- //

const isadmin = async (req,res, next) => {
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


// ---------------- // Function For when a Form is Submitted // ---------------- //

const  submit_form = async (req, res) => {
  const { name, topic, message } = req.body;

  console.log('Received login payload:', { name, topic, message });

  res.redirect('/sp%C3%B8rsm%C3%A5l');
};


// ---------------- // Check if user has a offical Cookie // ---------------- //

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


// ---------------- // Recive login request, test login then configure Cookie // ---------------- //

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


// ---------------- // Check if Ansatt And what type Ansatt Then redirect to the correct page // ---------------- //

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
      return res.redirect('/admin')

    } else if (permission === 3) {
      return res.redirect('/ansatt/kontor')

    } else if (permission === 2) {
      return res.redirect('/ansatt/lærer')

    } else if (permission === 1) {
      return res.redirect('/Error404?GuestPage=FALSE')

    } else {
      console.log('Unknown or unauthorized permission level:', permission);
      // Handle unknown permission
      return res.redirect('/Error404?PageAccess=DENIED');
    }
  }
};


// ---------------- // Test if User is admin or Teacher User (Methode of restriction) // ---------------- //

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


// ---------------- // Test if User is admin or Office User (Methode of restriction) // ---------------- //

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

// ---------------- // Restricting the admin page only for Administrators // ---------------- //

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


// ---------------- // Requesting Information for the teachers to display in a table // ---------------- //

const getTableData = async (req, res) => {
  try {
    const [results] = await db.execute(`
        SELECT
        k.KursID,
        k.Fag AS Fag,
        CONCAT(a.Fornavn, ' ', a.Etternavn) AS Lærer,
        CONCAT(e.Fornavn, ' ', e.Etternavn) AS Elev,
        kar.P1 AS prøve1,
        kar.P2 AS prøve2,
        kar.P3 AS prøve3,
        kar.SP AS standpunkt,
        d.AntallTimer AS timer_deltatt
      FROM kurs k
      JOIN ansatt a ON k.AnsattID = a.AnsattID
      JOIN karakterer kar ON kar.KursID = k.KursID
      JOIN elev e ON kar.ElevID = e.ElevID
      LEFT JOIN deltat d ON d.ElevID = e.ElevID AND d.KursID = k.KursID;  
    `);
    res.json(results);
  } catch (err) {
    console.error('Feil ved henting av data:', err);
    res.status(500).send('Feil ved databasen');
  }
};


// ---------------- // Applying changes to table when Teachers Change an Apply Changes // ---------------- //

const applyChanges = async (req, res) => {
  const changes = req.body;

  try {
    for (const entry of changes) {
      const [elevFornavn, elevEtternavn] = entry.Elev.split(' ');

      // Get ElevID and KursID
      const [[{ ElevID }]] = await db.execute(
        `SELECT ElevID FROM elev WHERE Fornavn = ? AND Etternavn = ?`,
        [elevFornavn, elevEtternavn]
      );

      const [[{ KarakterID } = {}]] = await db.execute(
        `SELECT KarakterID FROM karakterer WHERE ElevID = ? AND KursID = ?`,
        [ElevID, entry.KursID]
      );

      if (KarakterID) {
        await db.execute(
          `UPDATE karakterer SET P1 = ?, P2 = ?, P3 = ?, SP = ? WHERE KarakterID = ?`,
          [entry.prøve1, entry.prøve2, entry.prøve3, entry.standpunkt, KarakterID]
        );
      } else {
        await db.execute(
          `INSERT INTO karakterer (ElevID, KursID, P1, P2, P3, SP) VALUES (?, ?, ?, ?, ?, ?)`,
          [ElevID, entry.KursID, entry.prøve1, entry.prøve2, entry.prøve3, entry.standpunkt]
        );
      }

      const [[{ DeltaID } = {}]] = await db.execute(
        `SELECT DeltaID FROM deltat WHERE ElevID = ? AND KursID = ?`,
        [ElevID, entry.KursID]
      );

      if (DeltaID) {
        await db.execute(
          `UPDATE deltat SET AntallTimer = ? WHERE DeltaID = ?`,
          [entry.timer_deltatt, DeltaID]
        );
      } else {
        await db.execute(
          `INSERT INTO deltat (ElevID, KursID, AntallTimer) VALUES (?, ?, ?)`,
          [ElevID, entry.KursID, entry.timer_deltatt]
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Feil ved oppdatering:', err);
    res.status(500).send('Kunne ikke oppdatere data');
  }
};





// ---------------------------------------------// All Get Request made to the Website // ---------------------------------------------//





// ----- // Routing to the Home/Main/Landing page // ----- //

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home', 'index.html'));
});


// ----- // Routing to the Course page // ----- //

app.get('/kurs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Course', 'index.html'));
});


// ----- // Routing to the Error page // ----- //

app.get('/Error404', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Err4', 'index.html'));
});


// ----- // Routing to the Question page // ----- //

app.get('/sp%C3%B8rsm%C3%A5l', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Question', 'index.html'));
});


// ----- // Routing to the Create User page and running is admin Function to restrict the page // ----- //

app.get('/create', isadmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Create_new_user1', 'index.html'));
});


// ----- // Routing to the Login page // ----- //

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login1', 'index.html'));
});


// ----- // Making the Ansatt_role Function Handle Routing via permission lvl / employee role // ----- //

app.get('/ansatt', ansatt_role);


// ----- // Routing to the Employees/Office page running the ansatt_kontor Function as (Methode of restriction) // ----- //

app.get('/ansatt/kontor', ansatt_kontor, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_kontor', 'index.html'));
});


// ----- // Routing to the Employees/Teacher page running the ansatt_lærer Function as (Methode of restriction) // ----- //

app.get('/ansatt/l%C3%A6rer', ansatt_lærer, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_lærer', 'index.html'));
});


// ----- // Routing to admin page running the ansatt_admin Function as (Methode of restriction) // ----- //

app.get('/admin', ansatt_admin, (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'Employees_admin', 'index.html'));
});


// ----- // Routing to Personvernserklæring PDF // ----- //

app.get('/personvernerkl%C3%A6ring', (req) => {
  res.sendFile(path.join(__dirname, 'public', 'Src', 'Personvernerklæring.pdf'));
});


// ----- // Routing to Tilbakemelding PDF // ----- //

app.get('/tilbakemelding', (req) => {
  res.sendFile(path.join(__dirname, 'public', 'Src', 'Tilbakemelding.pdf'));
});


// ---------------------------------------------// All Post Request made to the Website // ---------------------------------------------//



// ----- // When get the POST Submit Form do the following Function // ----- //
app.post('/submit_form', submit_form);


// ----- // When get the POST Create_user do the following Function // ----- //
app.post('/create_user', isadmin, createUser);


// ----- // When get the POST Lag_kurs do the following Function // ----- //
app.post('/lag_kurs', lag_kurs);


// ----- // When get the POST Delete do the following Function // ----- //
app.post('/slett_kurs', slett_kurs);


// ----- // When get the POST Lag_elev do the following Function // ----- //
app.post('/lag_elev', lag_elev);


// ----- // When get the POST Slett_elev do the following Function // ----- //
app.post('/slett_elev', slett_elev);


// ----- // When get the POST Legtil_elev do the following Function // ----- //
app.post('/legtil_elev', legtil_elev);


// ----- // When get the POST login_auth do the following Function // ----- //
app.post('/login_auth', login_auth);


// ----- // When get the POST GetTableData do the following Function // ----- //
app.post('/getTableData', getTableData);


// ----- // When get the POST ApplyChanges do the following Function // ----- //
app.post('/applyChanges', applyChanges);





// ---------------------------------------------// Listen to the port to Check if Website is Running // ---------------------------------------------//





app.listen(port, () => {
    console.clear()
    console.log(`Server running on http://localhost:${port}`);
});
