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

// db_connect.getConnection((err, connection) => {
//     if (err)
//         throw err;
//     // const sql = 'CREATE TABLE items (id INT PRIMARY KEY, belong INT, title VARCHAR(255), message TEXT)';
//     const sql = 'SHOW FIELDS FROM users';
//     connection.query(sql, (err, result) => {
//         if (err)
//             throw err;
//         console.log(result);
//     });
// });

exports.db_query = (sql, next) => {
    db_connect.getConnection((err, connect) => {
        if (err)
            return next(err);
        connect.query(sql, (err, result) => {
            if (err)
                return next(err);
            console.log(result);
            return result;
        })
    })
}