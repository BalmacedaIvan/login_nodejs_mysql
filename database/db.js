const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect((error)=>{
    if(error){
        console.log('--- ERROR: ' + error);
        return;
    }
    console.log('---- CONNECTED TO DATABASE -----')
});

module.exports = connection;

