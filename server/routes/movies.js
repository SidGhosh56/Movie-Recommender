const express = require("express");
const router = express.Router();


const { getMoviesByGenre, getAllMovies, addMovie, getRandomMovie } = require("../controllers/movieController");
/*onst { getAllMovies, addMovie } = require("../controllers/movieController");
const { getRandomMovie } = require("../controllers/movieController");*/

router.get("/by_genre", getMoviesByGenre);
router.get("/", getAllMovies);
router.post("/", addMovie);
router.get("/random", getRandomMovie);

module.exports = router;
