const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const userController = require('../controllers/userController');

router.post('/update-profile', auth, userController.updateProfile);

router.post('/watched', auth, userController.addWatchedMovie);

router.delete('/watched/:movieId', auth, userController.removeWatchedMovie);

module.exports = router;
