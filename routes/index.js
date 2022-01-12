const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = passport.authenticate('jwt', {session: false});
const userController = require('../controllers/userController');
const itemController = require('../controllers/itemController');
const listController = require('../controllers/listController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// user api calls
router.get('/users', userController.get_all_user);
router.post('/signin', userController.create_user);
router.post('/login', userController.log_in);
router.put('/user/:id', auth, userController.edit_user);

// item api calls
router.get('/all', itemController.get_all);

module.exports = router;
