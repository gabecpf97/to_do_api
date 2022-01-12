const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const itemController = require('../controllers/itemController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// user api calls
router.get('/users', userController.get_all_user);
router.post('/user', userController.create_user);
router.post('/login', userController.log_in);

// item api calls
router.get('/all', itemController.get_all);

module.exports = router;
