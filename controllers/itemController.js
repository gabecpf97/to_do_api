const db = require('../connectDB');
const { body, check, validationResult } = require('express-validator');
const async = require('async');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.get_from_list = (req, res, next) => {
    const item_sql = `SELECT * FROM items WHERE belong = '${req.params.id}'`;
    db.db_query(item_sql, (err, itemList) => {
        if (err)
            return next(err);
        res.send({itemList});
    })
}