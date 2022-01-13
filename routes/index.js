const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = passport.authenticate('jwt', {session: false});
const userController = require('../controllers/userController');
const itemController = require('../controllers/itemController');
const listController = require('../controllers/listController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'This is backend' });
});

// user api calls
router.get('/users', userController.get_all_user);
router.post('/signup', userController.create_user);
router.post('/login', userController.log_in);
router.put('/user/password', auth, userController.change_password);
router.delete('/user', auth, userController.delete_user);
router.put('/user/:id', auth, userController.edit_user);

// list api calls
router.get('/lists', auth, listController.get_user_lists);
router.post('/list', auth, listController.create_list);
router.put('/list/:id', auth, listController.edit_list);
router.delete('/list/:id', auth, listController.delete_list);

// item api calls
router.get('/all_item/:id', auth, itemController.get_from_list);
router.post('/item', auth, itemController.create_item);
router.put('/item/:id', auth, itemController.edit_item);
router.put('/item/:id/priority', auth, itemController.change_priority);
router.put('/item/:id/status', auth, itemController.change_status);
router.delete('/item/:id', auth, itemController.delete_item);

module.exports = router;
