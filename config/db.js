
var mysql = require('mysql');
//start mysql connection
var connection = mysql.createConnection({
    host     : process.env.DATABASE_URL, //mysql database host name
    user     : process.env.DATABASE_USERNAME, //mysql database user name
    password : process.env.DATABASE_PASSWORD, //mysql database password
    database : process.env.DATABASE_NAME //mysql database name
  });

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected with mysql database...')
})
//end mysql connection

module.exports = connection;