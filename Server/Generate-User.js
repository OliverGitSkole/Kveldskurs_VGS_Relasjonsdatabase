const readline = require('readline');
const simplecrypt = require('simplecrypt');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const encrypt = simplecrypt();

rl.question('Username: ', username => {
  rl.question('Password: ', password => {
    try {
      const encryptedPassword = encrypt.encrypt(password); // Encrypt the password

      const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${encryptedPassword}');`;
      console.log('\n✅ SQL insert statement:\n');
      console.log(sql);
    } catch (err) {
      console.error('Error encrypting password:', err);
    } finally {
      rl.close();
    }
  });
});
