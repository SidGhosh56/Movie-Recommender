const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const userController = require('../controllers/userController');
const movieController = require('../controllers/movieController');

router.post('/update-profile', auth, userController.updateProfile);

router.post('/preferences', auth, userController.savePreferences);

router.get('/recommended-by-genres', auth, movieController.getRecommendedByGenres);

router.get('/me', auth, userController.getCurrentUser);

router.get('/popular', auth, movieController.getPopularMovies);

router.post('/tracker', auth, userController.addWatchedMovie);
router.delete('/tracker/:movieId', auth, userController.removeWatchedMovie);
router.get('/watched-movies', auth, userController.getWatchedMovies);

router.get('/:id', userController.getUser);

router.put('/:id', userController.updateUser);

module.exports = router;
