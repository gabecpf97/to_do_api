const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'mydb'
});

db.connect(err => {
    if (err)
        throw err;
    // const sql = 'SHOW DATABASES';
    const sql = 'SELECT * FROM user';
    db.query(sql, (err, result) => {
        if (err)
            throw err;
        console.log(result);
    })
});