const express = require("express");
const router = express.Router();
const auth = require('../middleware/Auth');

const { getMoviesByGenre, getAllMovies, addMovie, getRandomMovie, getSurpriseMovie, getMovieById, getSimilarMovies, getTopMovies, rateMovie, getUserRating, getTrendingMovies, getNewMovies, getRecommendedMovies } = require("../controllers/movieController");

router.get('/trending', getTrendingMovies);
router.get('/new', getNewMovies);
router.get('/recommended', getRecommendedMovies);

router.get("/by_genre", getMoviesByGenre);
router.get("/", getAllMovies);
router.post("/", addMovie);
router.get("/random", getRandomMovie);
router.get("/surprise", auth, getSurpriseMovie);
router.get('/top_movies', getTopMovies);

router.get('/:id', getMovieById);
router.get('/:id/similar',getSimilarMovies);

router.post('/:id/rate', auth, rateMovie);
router.get('/:id/user-rating', auth,getUserRating);
module.exports = router;






