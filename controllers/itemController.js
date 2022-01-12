const db = require('../connectDB');

exports.get_all = (req, res, next) => {
    // db.db_connect.getConnection((err, connect) => {
    //     if (err)
    //         return next(err);
        const sql = 'SELECT * FROM items';
    //     connect.query(sql, (err, result) => {
    //         if (err)
    //             return next(err);
    //         res.send({result});
    //     })
    // });
    res.send({result: db.db_query(sql, next)});
}