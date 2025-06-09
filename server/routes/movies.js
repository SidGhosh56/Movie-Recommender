const express = require("express");
const router = express.Router();
const auth = require('../middleware/Auth');

const { getMoviesByGenre, getAllMovies, addMovie, getRandomMovie, getSurpriseMovie, getMovieById, getSimilarMovies } = require("../controllers/movieController");

router.get("/by_genre", getMoviesByGenre);
router.get("/", getAllMovies);
router.post("/", addMovie);
router.get("/random", getRandomMovie);
router.get("/surprise", auth, getSurpriseMovie);

router.get('/:id', getMovieById);
router.get('/:id/similar',getSimilarMovies);
module.exports = router;






