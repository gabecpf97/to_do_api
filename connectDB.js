const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const db_connect = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'mydb'
});

exports.db_query = (sql, callback) => {
    db_connect.getConnection((err, connect) => {
        if (err)
            return callback(err);
        connect.query(sql, (err, result) => {
            if (err)
                return callback(err);
            callback(null, result);
        })
    })
}