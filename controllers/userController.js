const db = require('../connectDB');
const { body, check, validationResult   } = require('express-validator');
const bcrypt = require('bcrypt');
const { v4 } = require('uuid');

exports.get_all_user = (req, res, next) => {
    const sql = 'SELECT * FROM items';
    const result = db.db_query(sql, next);
    res.send({result});
}

exports.create_user = [
    body('username', "Username must be longer than 4 letter").trim().isLength({min: 4}).escape(),
    body('email', "Please enter an email address").trim().isEmail().normalizeEmail(),
    check('password').trim().isLength({min: 6}).escape()
    .withMessage('Passowrd must be longer than 6 letter').custom(value => {
        console.log(/\d/.test(value));
        return (/\d/.test(value));
    }).withMessage('Password must inclue numbers'),
    // check('confirm_password', 'Please enter the same password again').custom((value, { req }) => {
    //     return value === req.body.password;
    // }),
    (req, res, next) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(err);
        } else {
            res.send({body: req.body});
            // bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            //     if (err)
            //         return next(err);
            //     const sql = `INSERT INTO users (id, name, email, password) VALUES (1, ${req.body.username}, ${req.body.email}, ${hashedPassword})`;
            //     const result = db.db_query(sql, next);               
            //     res.send({ result });
            // });
        }
    }
]