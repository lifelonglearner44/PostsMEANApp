const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  database: 'your_mysql_database'
});

/**
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: {type: String, required: true },
  imagePath: { type: String, required: true }
});

*/

module.exports = connection;

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});


