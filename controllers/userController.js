const db = require('../connectDB');
const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.get_all_user = (req, res, next) => {
    const sql = 'SELECT * FROM users';
    const callback = (err, result) => {
        if (err)
            return next(err);
        res.send({result});
    }
    db.db_query(sql, callback);
}

exports.create_user = [
    body('username', "Username must be longer than 4 letter").trim().isLength({min: 4}).escape(),
    check('username').custom(value => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE name = '${value}'`;
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0)
                    reject('username already exists');
                resolve(true);
            });
        })
    }),
    body('email', "Please enter an email address").normalizeEmail().isEmail().escape(),
    check('email').custom(value => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = '${value}'`;
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0)
                    reject('email already exists');
                resolve(true);
            });
        })
    }),
    check('password').trim().isLength({min: 6}).escape()
    .withMessage('Passowrd must be longer than 6 letter').custom(value => {
        return (/\d/.test(value) && /\D/.test(value));
    }).withMessage('Password must inclue numbers and letters'),
    check('confirm_password', 'Please enter the same password again').custom((value, { req }) => {
        return value === req.body.password;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            const id = crypto.randomBytes(16).toString('hex');
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                if (err)
                    return next(err);
                const sql = `INSERT INTO users (id, username, email, password) VALUES ('${id}', '${req.body.username}', '${req.body.email}', '${hashedPassword}')`;
                db.db_query(sql, (err, result) => {
                    if (err)
                        return next(err);
                    const user = {
                        id,
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPassword
                    }
                    const list_id = crypto.randomBytes(16).toString('hex');
                    const values = `'${list_id}', '${id}', 'default'`;
                    const list_sql = `INSERT INTO lists (id, belong, name) VALUES(${values})`;
                    db.db_query(list_sql, (err, listResult) => {
                        if (err)
                            return next(err);
                        const token = jwt.sign({user}, process.env.S_KEY);
                        res.send({token, user});
                    })
                });
            });
        }
    }
]

exports.log_in = [
    body('email', "Please enter an email address").trim().normalizeEmail().isEmail().escape(),
    body('password').trim().escape(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            passport.authenticate('local', {session: false}, (err, user, info) => {
                if (err || !user)
                    return next(err || new Error(info.message));
                req.login(user, {session: false}, err => {
                    if (err)
                        return next(err);
                    const token = jwt.sign({user}, process.env.S_KEY);
                    res.send({token, user});
                });
            })(req, res, next);
        }
    }   
]

exports.edit_user = [
    body('username', "Username must be longer than 4 letter").trim().isLength({min: 4}).escape(),
    check('username').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE name = '${value}'`;
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0 && result[0].id !== req.user.id)
                    reject('username already exists');
                resolve(true);
            });
        })
    }),
    body('email', "Please enter an email address").normalizeEmail().isEmail().escape(),
    check('email').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = '${value}'`;
            db.db_query(sql, (err, result) => {
                if (result && result.length > 0 && result[0].id !== req.user.id)
                    reject('email already exists');
                resolve(true);
            });
        })
    }),
    (req, res, next) => {
        if (req.params.id === req.user.id) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next({errors: errors.array()});
            } else {
                const updates = `username = '${req.body.username}', email = '${req.body.email}'`;
                const sql = `UPDATE users SET ${updates} where id = '${req.params.id}'`;
                db.db_query(sql, (err, result) => {
                    if (err)
                        return next(err);
                    res.send({success: true});
                });
            }
        }
    }
]

exports.change_password = [
    body('password').trim().escape(),
    check('password').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(value, req.user.password, (err, result) => {
                if (err || !result)
                    return reject('Incorrect password');
                return resolve(true);
            });
        });
    }),
    check('new_password').trim().isLength({min: 6}).escape()
    .withMessage('Passowrd must be longer than 6 letter').custom(value => {
        return (/\d/.test(value));
    }).withMessage('Password must inclue numbers'),
    check('confirm_password', 'Please enter the same password again').custom((value, { req }) => {
        return value === req.body.new_password;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({errors: errors.array()});
        } else {
            bcrypt.hash(req.body.new_password, 10, (err, hashedPassword) => {
                if (err)
                    return next(err);
                const sql = `UPDATE users SET password = '${hashedPassword}' WHERE id = '${req.user.id}'`;
                db.db_query(sql, (err, result) => {
                    if (err)
                        return next(err);
                    res.send({success: true});
                })
            });
        }
    }
]

exports.delete_user = [
    check('password').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(value, req.user.password, (err, result) => {
                if (err || !result)
                    return reject('Incorrect password');
                return resolve(true);
            });
        });
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({erros: errors.array()});
        } else {
            const sql = `DELETE FROM users WHERE id = '${req.user.id}'`;
            db.db_query(sql, (err, result) => {
                if (err)
                    return next(err);
                res.send({success: true});
            })
        }
    }
]