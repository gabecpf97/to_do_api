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
    });
}

exports.create_item = [
    body('title', "Title must not be empty").trim().isLength({min: 1}).escape(),
    body('message').trim().escape(),
    check('priority', "Please select value from form").custom(value => {
        return (value > -1 && value < 4);
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({erros: errors.array()});
        } else {
            const item = {
                id: crypto.randomBytes(16).toString('hex'),
                belong: req.body.belong,
                title: req.body.title,
                message: req.body.message,
                date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                priority: req.body.priority,
                status: 0,
            };
            const sql = `INSERT INTO items (id, belong, title, message, date, priority, status)
                        VALUES (
                            '${item.id}',
                            '${item.belong}',
                            '${item.title}',
                            '${item.message}',
                            '${item.date}',
                            ${item.priority},
                            ${item.status}
                        )`.replace(/\n/ig, '');
            db.db_query(sql, (err,result) => {
                if (err)
                    return next(err);
                res.send({success: true});
            });
        }
    }
]

exports.edit_item = [
    body('title', "Title must not be empty").trim().isLength({min: 1}).escape(),
    body('message').trim().escape(),
    check('priority', "Please select value from form").custom(value => {
        return (value > -1 && value < 4);
    }),
    (req, res, next) => {
        const item_sql = `SELECT * FROM items WHERE id = '${req.params.id}'`;
        db.db_query(item_sql, (err, theItem) => {
            if (err)
                return next(err);
            if (theItem.length < 1) {
                return next(new Error('No such item'));
            } else {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.send({errors: errors.array()});
                } else {
                    const sql = `UPDATE items SET 
                                title = '${req.body.title}',
                                message = '${req.body.message}',
                                priority = '${req.body.priority}'
                                WHERE id = '${req.params.id}'`;
                    db.db_query(sql, (err, result) => {
                        if (err)
                            return next(err);
                        res.send({success: true});
                    });
                }
            }
        });
    }
]

exports.change_priority = [
    check('priority', "Please select value from form").custom(value => {
        return (value > -1 && value < 4);
    }),
    (req, res, next) => {
        const item_sql = `SELECT * FROM items WHERE id = '${req.params.id}'`;
        db.db_query(item_sql, (err, theItem) => {
            if (err)
                return next(err);
            if (theItem.length < 1) {
                return next(new Error('No such item'));
            } else {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.send({errors: errors.array()});
                } else {
                    const sql = `UPDATE items SET 
                                priority = '${req.body.priority}'
                                WHERE id = '${req.params.id}'`;
                    db.db_query(sql, (err, result) => {
                        if (err)
                            return next(err);
                        res.send({success: true});
                    });
                }
            }
        });
    }
]

exports.change_status = [
    check('status', "Please select from form").custom(value => {
        return (value < 2 && value > -1);
    }),
    (req, res, next) => {
        const item_sql = `SELECT * FROM items WHERE id = '${req.params.id}'`;
        db.db_query(item_sql, (err, theItem) => {
            if (err)
                return next(err);
            if (theItem.length < 1) {
                return next(new Error('No such item'));
            } else {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.send({errors: errors.array()});
                } else {
                    const sql = `UPDATE items SET 
                                status = '${req.body.status}'
                                WHERE id = '${req.params.id}'`;
                    db.db_query(sql, (err, result) => {
                        if (err)
                            return next(err);
                        res.send({success: true});
                    });
                }
            }
        });
    }
]