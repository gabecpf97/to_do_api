const db = require('../connectDB');
const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
        return (/\d/.test(value));
    }).withMessage('Password must inclue numbers'),
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
                const sql = `INSERT INTO users (id, name, email, password) VALUES ('${id}', '${req.body.username}', '${req.body.email}', '${hashedPassword}')`;
                db.db_query(sql, (err, result) => {
                    if (err)
                        return next(err);
                    res.send({result});
                });
            });
        }
    }
]