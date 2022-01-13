const db = require('../connectDB');
const { body, check, validationResult } = require('express-validator');
const async = require('async');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.get_user_lists = (req, res, next) => {
    const sql = `SELECT * FROM lists WHERE belong = "${req.user.id}"`;
    db.db_query(sql, (err, result) => {
        if (err)
            return next(err);
        async.map(result, (list, callback) => {
            const itemSql = `SELECT * FROM items WHERE belong = "${list.id}" ORDER BY priority DESC, date DESC`;
            db.db_query(itemSql, callback);
        }, (err, results) => {
            if (err)
                return next(err);
            res.send({results});
        });
    })
}

exports.create_list = [
    body('name', "Name must not be empty").trim().isLength({min: 1}).escape(),
    check('name').custom((value, { req }) => {
        const sql = `SELECT * FROM lists WHERE belong = "${req.user.id}" and name = "${value}"`;
        return new Promise((resolve, reject) => {
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0)
                    return reject('List name already exists');
                return resolve(true);
            });
        });
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            const id = crypto.randomBytes(16).toString('hex');
            const sql = `INSERT INTO lists (id, belong, name) values (
                '${id}',
                '${req.user.id}',
                '${req.body.name}'
            )`;
            db.db_query(sql, (err, result) => {
                if (err)
                    return next(err);
                res.send({success: true});
            })
        }
    }
]

exports.edit_list = [
    body('name', "Name must not be empty").trim().isLength({min: 1}).escape(),
    check('name').custom((value, { req }) => {
        const sql = `SELECT * FROM lists WHERE belong = "${req.user.id}" and name = "${value}"`;
        return new Promise((resolve, reject) => {
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0)
                    return reject('List name already exists');
                return resolve(true);
            });
        });
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            const list_sql = `SELECT * FROM lists WHERE id = '${req.params.id}'`;
            db.db_query(list_sql, (err, theList) => {
                if (err)
                    return next(err);
                if (!theList) {
                    return next(new Error('You dont have such list'));
                } else {
                    const id = crypto.randomBytes(16).toString('hex');
                    const sql = `UPDATE lists SET name = '${req.body.name}' WHERE id = '${req.params.id}'`;
                    db.db_query(sql, (err, result) => {
                        if (err)
                            return next(err);
                        res.send({success: true});
                    })
                }
            })
        }
    }
]