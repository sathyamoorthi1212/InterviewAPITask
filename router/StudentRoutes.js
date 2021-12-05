const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const passport = require('passport');
const passportAuth = passport.authenticate("jwt", { session: false });


/*Student Account*/
router.route('/signup').post(studentController.profileUpload, studentController.signup);
router.route('/list').get(passportAuth,studentController.list);
router.route('/delete/:id').put(passportAuth,studentController.deleteStudent);
router.route('/update/:id').put(passportAuth,studentController.profileUpload, studentController.update);
router.route('/login').post(studentController.login);
router.route('/logout/:id').post(passportAuth, studentController.logout);

module.exports = router;